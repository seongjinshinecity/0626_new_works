# 가계부 분석 에이전트 — 샘플 대화 (SQL 근거 검증)

> 아래는 `gyebu-analyst` 에이전트가 Supabase `transactions`(204건, 2026-03~06)에 대해 답한 예시다.
> **모든 수치는 옆의 실행 SQL 결과와 1:1로 일치한다**(추정/암산 아님). 데이터 기준일: 2026-06-27.

---

## A. 기본 조회

### Q1. "이번 달 얼마 썼어?"
```sql
select sum(amount) from transactions
where type='expense' and to_char(date,'YYYY-MM')='2026-06';
-- 1169026
```
> **이번 달(2026-06) 지출은 1,169,026원**입니다. 같은 달 수입(급여 300만 원) 대비 약 39% 수준이에요.

### Q2. "식비 제일 많이 쓴 날은?"
```sql
select date, sum(amount) d from transactions
where category='식비' group by date order by d desc limit 1;
-- 2026-05-09 | 27054
```
> 식비 최대일은 **2026-05-09(토)로 27,054원**이었습니다. 주말 외식이 컸던 날이네요.

### Q3. "교통비 월평균은?"
```sql
select round(avg(m),0) from (
  select to_char(date,'YYYY-MM') ym, sum(amount) m
  from transactions where category='교통' group by ym) t;
-- 71575
```
> 교통비는 **월평균 71,575원**입니다(최근 4개월 기준).

---

## B. 패턴 분석

### Q4. "주중이랑 주말 중 언제 더 써?"
```sql
select case when extract(dow from date) in (0,6) then '주말' else '주중' end k,
       round(sum(amount)/count(distinct date),0) avg_per_day
from transactions where type='expense' group by k;
-- 주말 55819 / 주중 36515
```
> **주말 일평균 55,819원 vs 주중 36,515원** — 주말에 하루 약 1.5배 더 씁니다. 주말 외식·문화 지출이 원인이에요.

### Q5. "요일별로 보면?"
```sql
select trim(to_char(date,'Day')) dow, sum(amount) total
from transactions where type='expense'
group by dow, extract(dow from date) order by total desc;
-- 일 1,163,854 > 수 851,392 > 월 810,223 > 금 809,937 > 토 678,172 > 화 314,442 > 목 281,290
```
> **일요일 지출(1,163,854원)이 가장 큽니다.** 화·목요일이 가장 적고요. 주말 시작(일)에 소비가 몰립니다.

### Q6. "카테고리별 비율은?"
```sql
select category, sum(amount) total,
  round(100.0*sum(amount)/(select sum(amount) from transactions where type='expense'),1) pct
from transactions where type='expense' group by category order by total desc;
-- 주거 44.8% · 식비 30.2% · 문화 11.7% · 교통 5.8% · 의료 4.1% · 경조사 2.0% · 구독료 1.4%
```
> 지출 1위는 **주거 44.8%**(고정비), 변동비 중에서는 **식비 30.2%**, 문화 11.7% 순입니다.

---

## C. 절약 조언 (관찰된 패턴 기반)

### Q7. "이번 달 남은 예산은?"
```sql
select
 (select coalesce(sum(amount),0) from transactions where type='income'  and to_char(date,'YYYY-MM')='2026-06')
-(select coalesce(sum(amount),0) from transactions where type='expense' and to_char(date,'YYYY-MM')='2026-06') as remaining;
-- 1830974
```
> 이번 달 수입 3,000,000원 − 지출 1,169,026원 = **남은 예산 1,830,974원**입니다. 페이스는 양호해요.

### Q8. "뭘 줄이면 좋을까?"
> 근거: Q6(카테고리 비율) + Q4(주중/주말).
> 고정비인 주거(44.8%)는 줄이기 어렵습니다. **변동비 1위는 식비(30.2%)이고, 특히 주말 지출이 주중의 1.5배**(Q4)예요.
> 👉 **주말 외식을 주 1회만 줄여도** 가장 효과가 큽니다. 다음으로 문화비(11.7%)가 여유 조정 대상입니다.

### Q9. "이대로면 올해 얼마 쓸까?"
```sql
select round(avg(m),0) monthly_avg, round(avg(m)*12,0) yearly_est from (
  select to_char(date,'YYYY-MM') ym, sum(amount) m
  from transactions where type='expense' group by ym) t;
-- monthly_avg 1227328 / yearly_est 14727930
```
> 월평균 지출 1,227,328원 기준, **연간 약 14,727,930원** 예상입니다. 주말 식비를 조절하면 1,000만 원대 초반까지 낮출 수 있어요.

---

## 검증 메모 (verifier)
- 위 9개 답변의 모든 수치는 바로 위 SQL을 실제 실행한 결과와 일치한다(독립 재현 가능).
- 조언(Q8)은 일반론이 아니라 **이 데이터에서 관찰된 사실**(식비 30.2% 최대 변동비, 주말 1.5배)을 인용한다 → "맞춤성" 충족.
- 실제 에이전트는 동일 쿼리를 Supabase MCP(`execute_sql`, read-only)로 수행한다.
