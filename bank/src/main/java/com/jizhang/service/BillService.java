package com.jizhang.service;

import com.jizhang.entity.Bill;
import com.jizhang.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BillService {

    private final BillRepository billRepository;

    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    /** 按月份查询 */
    public List<Bill> getBillsByMonth(String month) {
        // month格式: "2026-07"
        String start = month + "-01";
        YearMonth ym = YearMonth.parse(month);
        String end = month + "-" + String.format("%02d", ym.lengthOfMonth());
        return billRepository.findByDateBetween(LocalDate.parse(start), LocalDate.parse(end));
    }

    /** 单条查询 */
    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("账单不存在: " + id));
    }

    /** 添加 */
    public Bill addBill(Bill bill) {
        if (bill.getCreateTime() == null) {
            bill.setCreateTime(System.currentTimeMillis());
        }
        return billRepository.save(bill);
    }

    /** 删除 */
    public void deleteBill(Long id) {
        billRepository.deleteById(id);
    }

    /** 月度统计 */
    public Map<String, Object> getMonthlyStats(String month) {
        List<Bill> bills = getBillsByMonth(month);

        double totalExpense = 0, totalIncome = 0;
        Map<String, Map<String, Object>> expenseMap = new LinkedHashMap<>();
        Map<String, Map<String, Object>> incomeMap = new LinkedHashMap<>();

        for (Bill b : bills) {
            if ("expense".equals(b.getType())) {
                totalExpense += b.getAmount();
                expenseMap.computeIfAbsent(b.getCategory(), k -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("code", b.getCategory());
                    m.put("name", b.getCategoryName());
                    m.put("icon", b.getCategoryIcon());
                    m.put("amount", 0.0);
                    return m;
                });
                expenseMap.get(b.getCategory()).put("amount",
                        (double) expenseMap.get(b.getCategory()).get("amount") + b.getAmount());
            } else {
                totalIncome += b.getAmount();
                incomeMap.computeIfAbsent(b.getCategory(), k -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("code", b.getCategory());
                    m.put("name", b.getCategoryName());
                    m.put("icon", b.getCategoryIcon());
                    m.put("amount", 0.0);
                    return m;
                });
                incomeMap.get(b.getCategory()).put("amount",
                        (double) incomeMap.get(b.getCategory()).get("amount") + b.getAmount());
            }
        }

        final double finalTotalExpense = totalExpense;
        final double finalTotalIncome = totalIncome;

        List<Map<String, Object>> categoryExpenses = expenseMap.values().stream().map(m -> {
            double amt = Math.round((double) m.get("amount") * 100.0) / 100.0;
            m.put("amount", amt);
            m.put("percentage", finalTotalExpense > 0
                    ? Math.round((amt / finalTotalExpense) * 1000.0) / 10.0 : 0.0);
            return m;
        }).sorted((a, b) -> Double.compare((double) b.get("amount"), (double) a.get("amount")))
          .collect(Collectors.toList());

        List<Map<String, Object>> categoryIncomes = incomeMap.values().stream().map(m -> {
            double amt = Math.round((double) m.get("amount") * 100.0) / 100.0;
            m.put("amount", amt);
            m.put("percentage", finalTotalIncome > 0
                    ? Math.round((amt / finalTotalIncome) * 1000.0) / 10.0 : 0.0);
            return m;
        }).sorted((a, b) -> Double.compare((double) b.get("amount"), (double) a.get("amount")))
          .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalExpense", Math.round(totalExpense * 100.0) / 100.0);
        result.put("totalIncome", Math.round(totalIncome * 100.0) / 100.0);
        result.put("budget", 5000);
        result.put("categoryExpenses", categoryExpenses);
        result.put("categoryIncomes", categoryIncomes);
        return result;
    }

    /** 每日趋势 */
    public List<Map<String, Object>> getDailyTrend(String month) {
        YearMonth ym = YearMonth.parse(month);
        int days = ym.lengthOfMonth();
        List<Bill> bills = getBillsByMonth(month);

        // 初始化每天数据
        Map<Integer, Map<String, Object>> dayMap = new LinkedHashMap<>();
        for (int d = 1; d <= days; d++) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", String.format("%s-%02d", month, d));
            m.put("day", d + "日");
            m.put("expense", 0.0);
            m.put("income", 0.0);
            dayMap.put(d, m);
        }

        // 填充实际数据
        for (Bill b : bills) {
            int day = b.getDate().getDayOfMonth();
            Map<String, Object> m = dayMap.get(day);
            if (m != null) {
                if ("expense".equals(b.getType())) {
                    m.put("expense", (double) m.get("expense") + b.getAmount());
                } else {
                    m.put("income", (double) m.get("income") + b.getAmount());
                }
            }
        }

        // 取整
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> m : dayMap.values()) {
            m.put("expense", Math.round((double) m.get("expense") * 100.0) / 100.0);
            m.put("income", Math.round((double) m.get("income") * 100.0) / 100.0);
            result.add(m);
        }
        return result;
    }
}
