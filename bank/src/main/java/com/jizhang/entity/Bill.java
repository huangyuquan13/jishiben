package com.jizhang.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "t_bill")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 类型: expense(支出) / income(收入) */
    @Column(nullable = false, length = 20)
    private String type;

    /** 金额 */
    @Column(nullable = false)
    private Double amount;

    /** 分类代码 */
    @Column(nullable = false, length = 50)
    private String category;

    /** 分类名称 */
    @Column(nullable = false, length = 50)
    private String categoryName;

    /** 分类图标 */
    @Column(length = 10)
    private String categoryIcon;

    /** 日期 (YYYY-MM-DD) */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate date;

    /** 备注 */
    @Column(length = 100)
    private String note;

    /** 创建时间戳 */
    @Column(nullable = false)
    private Long createTime;

    // ===== 构造方法 =====
    public Bill() {}

    // ===== Getter / Setter =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Long getCreateTime() { return createTime; }
    public void setCreateTime(Long createTime) { this.createTime = createTime; }
}
