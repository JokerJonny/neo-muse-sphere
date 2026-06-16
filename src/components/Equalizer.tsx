export function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex h-4 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary"
          style={{
            height: active ? "100%" : "30%",
            animation: active
              ? `equalize ${0.6 + i * 0.18}s ease-in-out ${i * 0.1}s infinite`
              : "none",
          }}
        />
      ))}
    </div>
  );
}
