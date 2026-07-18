package com.jizhang.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class SettingsController {

    private final Map<String, Object> settings;

    public SettingsController() {
        settings = new LinkedHashMap<>();
        settings.put("monthlyBudget", 5000);

        List<Map<String, Object>> categories = new ArrayList<>();

        Map<String, Object> c1 = new LinkedHashMap<>(); c1.put("code","food"); c1.put("name","餐饮"); c1.put("icon","🍜"); c1.put("type","expense"); categories.add(c1);
        Map<String, Object> c2 = new LinkedHashMap<>(); c2.put("code","shopping"); c2.put("name","购物"); c2.put("icon","🛒"); c2.put("type","expense"); categories.add(c2);
        Map<String, Object> c3 = new LinkedHashMap<>(); c3.put("code","transport"); c3.put("name","交通"); c3.put("icon","🚌"); c3.put("type","expense"); categories.add(c3);
        Map<String, Object> c4 = new LinkedHashMap<>(); c4.put("code","entertainment"); c4.put("name","娱乐"); c4.put("icon","🎮"); c4.put("type","expense"); categories.add(c4);
        Map<String, Object> c5 = new LinkedHashMap<>(); c5.put("code","housing"); c5.put("name","住房"); c5.put("icon","🏠"); c5.put("type","expense"); categories.add(c5);
        Map<String, Object> c6 = new LinkedHashMap<>(); c6.put("code","medical"); c6.put("name","医疗"); c6.put("icon","🏥"); c6.put("type","expense"); categories.add(c6);
        Map<String, Object> c7 = new LinkedHashMap<>(); c7.put("code","education"); c7.put("name","教育"); c7.put("icon","🎓"); c7.put("type","expense"); categories.add(c7);
        Map<String, Object> c8 = new LinkedHashMap<>(); c8.put("code","other_expense"); c8.put("name","其他支出"); c8.put("icon","📦"); c8.put("type","expense"); categories.add(c8);
        Map<String, Object> c9 = new LinkedHashMap<>(); c9.put("code","salary"); c9.put("name","工资"); c9.put("icon","💰"); c9.put("type","income"); categories.add(c9);
        Map<String, Object> c10 = new LinkedHashMap<>(); c10.put("code","part_time"); c10.put("name","兼职"); c10.put("icon","💼"); c10.put("type","income"); categories.add(c10);
        Map<String, Object> c11 = new LinkedHashMap<>(); c11.put("code","investment"); c11.put("name","理财"); c11.put("icon","📈"); c11.put("type","income"); categories.add(c11);
        Map<String, Object> c12 = new LinkedHashMap<>(); c12.put("code","gift"); c12.put("name","礼金"); c12.put("icon","🎁"); c12.put("type","income"); categories.add(c12);
        Map<String, Object> c13 = new LinkedHashMap<>(); c13.put("code","other_income"); c13.put("name","其他收入"); c13.put("icon","🪙"); c13.put("type","income"); categories.add(c13);

        settings.put("categories", categories);
    }

    @GetMapping("/settings")
    public Map<String, Object> getSettings() {
        return settings;
    }

    @PutMapping("/settings")
    public Map<String, Object> updateSettings(@RequestBody Map<String, Object> body) {
        settings.putAll(body);
        return settings;
    }

    @PostMapping("/settings/categories")
    public Map<String, Object> addCategory(@RequestBody Map<String, Object> cat) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> categories = (List<Map<String, Object>>) settings.get("categories");
        if (categories == null) {
            categories = new ArrayList<>();
            settings.put("categories", categories);
        }
        categories.add(cat);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("categories", categories);
        return result;
    }

    @DeleteMapping("/settings/categories/{code}")
    public Map<String, Object> deleteCategory(@PathVariable String code) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> categories = (List<Map<String, Object>>) settings.get("categories");
        if (categories != null) {
            categories.removeIf(c -> code.equals(c.get("code")));
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("categories", categories);
        return result;
    }
}
