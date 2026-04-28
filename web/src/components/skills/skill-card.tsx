interface SkillCardProps {
  skill: {
    name: string;
    displayName: string;
    description: string;
    version: string;
    type: string;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6 hover:border-[#22C55E]/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">{skill.displayName}</h3>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
          skill.type === "native"
            ? "bg-[#22C55E]/10 text-[#22C55E]"
            : "bg-[#3B82F6]/10 text-[#3B82F6]"
        }`}>
          {skill.type === "native" ? "内置" : "OpenClaw"}
        </span>
      </div>
      <p className="text-sm text-[#94A3B8] mb-4">{skill.description}</p>
      <p className="text-xs text-[#64748B]">v{skill.version}</p>
    </div>
  );
}
