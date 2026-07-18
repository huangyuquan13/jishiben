package com.jizhang.controller;

import com.jizhang.entity.Bill;
import com.jizhang.service.BillService;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    // ===== 账单 CRUD =====

    /** 获取指定月份账单 */
    @GetMapping("/bills")
    public List<Bill> getBills(@RequestParam(defaultValue = "2026-07") String month) {
        return billService.getBillsByMonth(month);
    }

    /** 获取单条账单 */
    @GetMapping("/bills/{id}")
    public Bill getBill(@PathVariable Long id) {
        return billService.getBillById(id);
    }

    /** 添加账单 */
    @PostMapping("/bills")
    public Bill addBill(@RequestBody Bill bill) {
        return billService.addBill(bill);
    }

    /** 删除账单 */
    @DeleteMapping("/bills/{id}")
    public Map<String, Object> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("message", "删除成功");
        return result;
    }

    // ===== 统计 =====

    /** 月度统计 */
    @GetMapping("/bills/stats")
    public Map<String, Object> getMonthlyStats(@RequestParam(defaultValue = "2026-07") String month) {
        return billService.getMonthlyStats(month);
    }

    /** 每日趋势 */
    @GetMapping("/bills/trend")
    public List<Map<String, Object>> getDailyTrend(@RequestParam(defaultValue = "2026-07") String month) {
        return billService.getDailyTrend(month);
    }
}
