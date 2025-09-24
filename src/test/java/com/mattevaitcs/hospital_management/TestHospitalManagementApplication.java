package com.mattevaitcs.hospital_management;

import org.springframework.boot.SpringApplication;

public class TestHospitalManagementApplication {

	public static void main(String[] args) {
		SpringApplication.from(HospitalManagementApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
