package com.subtrack.subscriptionservice;

import com.subtrack.subscriptionservice.dto.PlanDto;
import com.subtrack.subscriptionservice.entity.Plan;
import com.subtrack.subscriptionservice.exception.ResourceNotFoundException;
import com.subtrack.subscriptionservice.repository.PlanRepository;
import com.subtrack.subscriptionservice.service.PlanServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PlanServiceTest {

    @Mock
    private PlanRepository planRepository;

    @InjectMocks
    private PlanServiceImpl planService;

    private Plan samplePlan;

    @BeforeEach
    void setUp() {
        samplePlan = new Plan(1L, "Pro Plan", "Full access to all features", new BigDecimal("49.99"), 30, true);
    }

    @Test
    @DisplayName("Positive: Get all active plans returns list")
    void testGetAllActivePlans() {
        when(planRepository.findByActiveTrue()).thenReturn(List.of(samplePlan));

        List<PlanDto> result = planService.getAllActivePlans();

        assertEquals(1, result.size());
        assertEquals("Pro Plan", result.get(0).getName());
        assertEquals(new BigDecimal("49.99"), result.get(0).getPrice());
    }

    @Test
    @DisplayName("Positive: Get plan by valid ID returns plan DTO")
    void testGetPlanById_Found() {
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        PlanDto result = planService.getPlanById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Pro Plan", result.getName());
    }

    @Test
    @DisplayName("Negative: Get plan by non-existent ID throws ResourceNotFoundException")
    void testGetPlanById_NotFound_ThrowsException() {
        when(planRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> planService.getPlanById(999L));
    }

    @Test
    @DisplayName("Positive: Create new plan successfully")
    void testCreatePlan_Success() {
        PlanDto dto = new PlanDto(null, "Starter Plan", "Basic access", new BigDecimal("19.99"), 30, true);
        when(planRepository.save(any(Plan.class))).thenAnswer(inv -> {
            Plan p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });

        PlanDto created = planService.createPlan(dto);

        assertNotNull(created);
        assertEquals(2L, created.getId());
        assertEquals("Starter Plan", created.getName());
        verify(planRepository, times(1)).save(any(Plan.class));
    }

    @Test
    @DisplayName("Positive: Update existing plan successfully")
    void testUpdatePlan_Success() {
        PlanDto updateDto = new PlanDto(1L, "Pro Plan Updated", "Updated desc", new BigDecimal("59.99"), 30, true);
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        when(planRepository.save(any(Plan.class))).thenAnswer(inv -> inv.getArgument(0));

        PlanDto updated = planService.updatePlan(1L, updateDto);

        assertNotNull(updated);
        assertEquals("Pro Plan Updated", updated.getName());
        assertEquals(new BigDecimal("59.99"), updated.getPrice());
    }

    @Test
    @DisplayName("Negative: Update non-existent plan throws ResourceNotFoundException")
    void testUpdatePlan_NotFound_ThrowsException() {
        PlanDto updateDto = new PlanDto(999L, "Non Existent", "Desc", new BigDecimal("10.00"), 30, true);
        when(planRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> planService.updatePlan(999L, updateDto));
        verify(planRepository, never()).save(any());
    }

    @Test
    @DisplayName("Positive: Delete existing plan successfully")
    void testDeletePlan_Success() {
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        planService.deletePlan(1L);

        verify(planRepository, times(1)).delete(samplePlan);
    }

    @Test
    @DisplayName("Negative: Delete non-existent plan throws ResourceNotFoundException")
    void testDeletePlan_NotFound_ThrowsException() {
        when(planRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> planService.deletePlan(999L));
        verify(planRepository, never()).delete(any());
    }
}
