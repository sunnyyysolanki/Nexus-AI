package com.nexus.rca_service.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nexus.rca_service.dto.RcaRequest;
import com.nexus.rca_service.dto.RcaResponse;
import com.nexus.rca_service.service.RcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1/rca")
@RequiredArgsConstructor
public class RcaController {

    private final RcaService rcaService;

    @PostMapping("/generate")
    public RcaResponse generateRca(@RequestBody RcaRequest rcaRequest) throws JsonProcessingException {
        return rcaService.generateRca(rcaRequest);
    }

}
