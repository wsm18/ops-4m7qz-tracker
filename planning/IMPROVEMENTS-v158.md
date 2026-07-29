# IMPROVEMENTS-v158 — Commons layer, seventh tree: Soldier Athlete

Session scope: write the Commons tier for the **Soldier Athlete** Mythic tree (`cat:"physical"`), the seventh of the 10 remaining Mythic trees needing Commons content. Confirmed by walking `SEED_SKILLS` directly (Node script, same method as v148–v157): 125 setKeys, 0 pre-existing members, all `cat:"physical"`, no collision with the 10 known pre-existing name+cat dupes (none of which are in `physical`).

Reuses the v150–v157 Common object shape exactly:
```
{name:"...", cat:"physical", rarity:"common", fadeDays:30, setKey:"<uncommon's synthesizedFrom>",
 why:"...", howTo:"...",
 levels:["L1...","L2...","L3...","L4..."],
 roadmap:["...","...","...","..."],
 advance:["...","...","...","..."],
 maintain:["...","...","...","..."]}
```
No `synthesizedFrom`/`unlockHint`/`tiers` fields. `safety` is an optional extra field (seen in existing Commons), fine to include when relevant.

## The 25 Rare groups (5 setKeys / 25 skills each)

1. Close-Quarters Combat Mastery > CQC Striking — phys_c_cqc_striking, phys_c_cqc_punch, phys_c_cqc_elbow, phys_c_cqc_knee, phys_c_cqc_kick
2. Close-Quarters Combat Mastery > CQC Grappling — phys_c_cqc_grappling, phys_c_cqc_composure, phys_c_cqc_clinch, phys_c_cqc_takedown, phys_c_cqc_ground_control
3. Close-Quarters Combat Mastery > CQC Weapons Retention — physb_c_holster_security, physb_c_strip_defense, physb_c_retention_strikes, physb_c_one_handed_weapon, physb_c_retention_recovery
4. Close-Quarters Combat Mastery > CQC Ground Defense — physb_c_guard_position, physb_c_hip_escape, physb_c_getting_to_feet, physb_c_back_take_defense, physb_c_ground_and_pound_defense
5. Close-Quarters Combat Mastery > CQC Scenario Integration — physb_c_force_continuum, physb_c_leaps_deescalation, physb_c_scenario_based_training, physb_c_after_action_assessment, physb_c_legal_justification
6. Army Fitness Excellence > AFT Mastery — phys_c_aft_hrp, phys_c_aft_mdl, phys_c_aft_tmr, phys_c_aft_sdc, phys_c_aft_plk
7. Army Fitness Excellence > Soldier Fitness Standards — phys_c_soldier_push, phys_c_soldier_pull, phys_c_soldier_squat, phys_c_soldier_carry, phys_c_soldier_lunge
8. Army Fitness Excellence > Field Physical Readiness — phys_c_field_long_run, phys_c_field_ruck, phys_c_field_comp_run, phys_c_field_swim, phys_c_field_balance
9. Army Fitness Excellence > Tactical Athleticism — physb_c_reactive_agility, physb_c_kit_sprint, physb_c_direction_change, physb_c_loaded_jump, physb_c_multidir_accel
10. Army Fitness Excellence > Physical Testing & Benchmarking — physb_c_baseline_metrics, physb_c_test_protocols, physb_c_tracking_tools, physb_c_limiters, physb_c_trend_interp
11. Physical Versatility > Movement Arts — physb_c_flexibility, physb_c_restraint, physb_c_str_programming, physb_c_gymnastics, physb_c_yoga
12. Physical Versatility > Primal Movement Patterns — physb_c_crawling, physb_c_climbing, physb_c_jump_mechanics, physb_c_hanging_grip, physb_c_carry_patterns
13. Physical Versatility > Acrobatic Control — physb_c_forward_roll, physb_c_backward_roll, physb_c_breakfall, physb_c_lateral_roll, physb_c_tumbling
14. Physical Versatility > Loaded Movement Arts — physb_c_sandbag_carries, physb_c_ruck_quality, physb_c_weighted_carries, physb_c_vest_mobility, physb_c_load_in_motion
15. Physical Versatility > Environmental Movement — physb_c_rope_climb, physb_c_obstacle_crossing, physb_c_terrain_running, physb_c_open_water, physb_c_cross_terrain_nav
16. Operational Endurance > Back-to-Back Performance — physb_c_bb_pacing, physb_c_recovery_nutrition, physb_c_training_density, physb_c_cumulative_fatigue, physb_c_multiday_programming
17. Operational Endurance > Sleep Deprivation Tolerance — physb_c_sleep_debt, physb_c_cog_perf_sleep, physb_c_stimulant_mgmt, physb_c_strategic_napping, physb_c_post_deprivation_recovery
18. Operational Endurance > Environmental Adaptation — physb_c_heat_acclim, physb_c_cold_ops, physb_c_altitude_adj, physb_c_humidity_mgmt, physb_c_hydration_stress
19. Operational Endurance > Sustained Physical Output — physb_c_event_pacing, physb_c_energy_mgmt, physb_c_caloric_intake, physb_c_mental_pacing, physb_c_load_effort_balance
20. Operational Endurance > Occupational Load Management — physb_c_load_distribution, physb_c_hotspot_prevention, physb_c_kit_packing, physb_c_gait_adaptation, physb_c_injury_prevention_load
21. Physical Leadership > Unit PT Design — physb_c_unit_fit_assess, physb_c_pt_periodization, physb_c_collective_events, physb_c_safety_planning, physb_c_group_overload
22. Physical Leadership > Physical Standards Coaching — physb_c_technique_coaching, physb_c_perf_limiters, physb_c_remediation_program, physb_c_feedback_delivery, physb_c_motivation_accountability
23. Physical Leadership > Athlete Development — physb_c_ind_dev_plan, physb_c_benchmark_setting, physb_c_failure_analysis, physb_c_school_selection_prep, physb_c_long_term_progression
24. Physical Leadership > Fitness Assessment & Evaluation — physb_c_aft_admin, physb_c_score_recording, physb_c_trend_analysis, physb_c_body_comp_eval, physb_c_objection_handling
25. Physical Leadership > Physical Mentorship — physb_c_opening_conversation, physb_c_cycle_management, physb_c_setback_coaching, physb_c_long_distance_mentor, physb_c_physical_culture

## Process (established v145–v157, see NEXT-SESSION-PROMPT.md)

- Pre-place 125 unique `// SLOT:<setKey>:<parent-unc-name>:physical` marker comments in one edit.
- Dispatch one agent per group above (5 setKeys/25 skills), capped at 2 concurrent agents per wave, 13 waves.
- Every agent prompt: Edit-tool preference over scripts, group-boundary trailing-comma warning, v153/v154/v157 failure modes called out explicitly, self-verify why/howTo presence + trailing comma on a sample before reporting done.
- After every wave: `node --check`, member-count sweep for that wave's setKeys, marker-count drop check, full required-field/array-length validator, check no previously-clean setKey regressed.
- After full tree: recursive whole-tree sweep (125 setKeys, 625 Commons, 5/5/5/5 all the way up), full required-field validator across all 625 together, whole-file name+cat dup sweep (expect exactly 10, unchanged).
- Ship checklist per CLAUDE.md / NEXT-SESSION-PROMPT.md: build, check, regress, bump sw.js to v158, package, update FINISHED-FEATURES.md + NEXT-SESSION-PROMPT.md, log session time, commit.
