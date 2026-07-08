/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CareerLevelConfig } from "../types";

export const CAREER_LEVELS: CareerLevelConfig[] = [
  {
    level: 1,
    name: "Mülhime",
    minDirectRefs: 2,
    minTeamCiro: 500,
    monolineDepthLimit: 10
  },
  {
    level: 2,
    name: "Mutmainne",
    minDirectRefs: 3,
    minTeamCiro: 1500,
    monolineDepthLimit: 20
  },
  {
    level: 3,
    name: "Radiye",
    minDirectRefs: 4,
    minTeamCiro: 3500,
    monolineDepthLimit: 40
  },
  {
    level: 4,
    name: "Mardiyye",
    minDirectRefs: 5,
    minTeamCiro: 7500,
    monolineDepthLimit: 60
  },
  {
    level: 5,
    name: "Safiyye",
    minDirectRefs: 6,
    minTeamCiro: 15000,
    monolineDepthLimit: 80
  },
  {
    level: 6,
    name: "Mürşid",
    minDirectRefs: 8,
    minTeamCiro: 30000,
    monolineDepthLimit: 100
  },
  {
    level: 7,
    name: "Pir",
    minDirectRefs: 10,
    minTeamCiro: 60000,
    monolineDepthLimit: 150
  },
  {
    level: 8,
    name: "Kutub",
    minDirectRefs: 12,
    minTeamCiro: 120000,
    monolineDepthLimit: 200
  },
  {
    level: 9,
    name: "Gavs",
    minDirectRefs: 15,
    minTeamCiro: 250000,
    monolineDepthLimit: 300
  },
  {
    level: 10,
    name: "İnsan-ı Kamil",
    minDirectRefs: 20,
    minTeamCiro: 500000,
    monolineDepthLimit: Infinity
  }
];
