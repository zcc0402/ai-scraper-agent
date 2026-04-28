import type { Skill } from "./types";

export class SkillRegistry {
  private skills = new Map<string, Skill>();

  register(skill: Skill) {
    this.skills.set(skill.name, skill);
  }

  match(urlOrQuery: string): Skill {
    for (const skill of this.skills.values()) {
      if (skill.match(urlOrQuery)) return skill;
    }
    return this.skills.get("generic")!;
  }

  list(): Skill[] {
    return [...this.skills.values()];
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }
}

export const skillRegistry = new SkillRegistry();
