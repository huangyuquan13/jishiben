package com.jizhang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JizhangApplication {
    public static void main(String[] args) {
        SpringApplication.run(JizhangApplication.class, args);
        System.out.println("========================================");
        System.out.println("  记账小工具后端启动成功！");
        System.out.println("  API地址: http://localhost:8080/api");
        System.out.println("  H2控制台: http://localhost:8080/h2-console");
        System.out.println("========================================");
    }
}
