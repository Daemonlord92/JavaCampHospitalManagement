package com.mattevaitcs.hospital_management.controllers;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class StaticController {

    @RequestMapping(value = {"/", ""}, method = RequestMethod.GET, produces = "text/html")
    public String landingPage() {
        return "landing-page";
    }
}
