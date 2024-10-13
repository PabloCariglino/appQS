package com.QS.AppQuickSolutions.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class HomeController {

    public String Home() {

        return "/";
    }
    
}
