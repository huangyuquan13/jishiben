package com.jizhang.config;

import com.jizhang.entity.Bill;
import com.jizhang.repository.BillRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final BillRepository billRepository;

    public DataInitializer(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @Override
    public void run(String... args) {
        // 只在表为空时插入初始数据
        if (billRepository.count() > 0) return;

        billRepository.save(create("expense", 35.00, "food", "餐饮", "🍜", "2026-07-07", "午餐麻辣烫外卖", 1720336200000L));
        billRepository.save(create("expense", 8.00, "transport", "交通", "🚌", "2026-07-07", "地铁出行", 1720302300000L));
        billRepository.save(create("expense", 156.00, "shopping", "购物", "🛒", "2026-07-06", "优衣库夏装短袖", 1720248000000L));
        billRepository.save(create("income", 8500.00, "salary", "工资", "💰", "2026-07-05", "6月份基本工资发放", 1720166400000L));
        billRepository.save(create("expense", 120.00, "entertainment", "娱乐", "🎮", "2026-07-04", "Steam夏季大促买游戏", 1720080000000L));
        billRepository.save(create("expense", 45.00, "food", "餐饮", "🍜", "2026-07-03", "晚上和同事聚餐AA", 1719993600000L));
        billRepository.save(create("expense", 15.00, "transport", "交通", "🚌", "2026-07-02", "打车回家", 1719907200000L));
        billRepository.save(create("expense", 2200.00, "housing", "住房", "🏠", "2026-07-01", "7月份房租扣款", 1719820800000L));
        billRepository.save(create("expense", 65.00, "food", "餐饮", "🍜", "2026-06-28", "海底捞火锅", 1719572400000L));
        billRepository.save(create("expense", 49.00, "shopping", "购物", "🛒", "2026-06-25", "生活日用品购买", 1719313200000L));
        billRepository.save(create("income", 8500.00, "salary", "工资", "💰", "2026-06-05", "5月份基本工资发放", 1717596000000L));
        billRepository.save(create("expense", 300.00, "education", "教育", "🎓", "2026-06-15", "网课学习教材", 1718457600000L));

        System.out.println("初始数据加载完成: " + billRepository.count() + " 条记录");
    }

    private Bill create(String type, double amount, String cat, String catName, String icon, String date, String note, long time) {
        Bill b = new Bill();
        b.setType(type);
        b.setAmount(amount);
        b.setCategory(cat);
        b.setCategoryName(catName);
        b.setCategoryIcon(icon);
        b.setDate(LocalDate.parse(date));
        b.setNote(note);
        b.setCreateTime(time);
        return b;
    }
}
