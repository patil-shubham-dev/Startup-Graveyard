"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./explore.module.css";

export interface DropdownOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  options: DropdownOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  allLabel?: string;
  align?: "left" | "right";
}

/*
 * Editorial listbox dropdown (APG menu-button pattern): the trigger stays
 * in the tab order; opening moves focus into the listbox with roving
 * tabindex. Arrows / Home / End navigate, Enter / Space select, Esc or
 * Tab or click-outside closes and returns focus to the trigger.
 */
export function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
  allLabel,
  align = "left",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === selected)?.label ?? null,
    [options, selected],
  );

  // Option 0 is the reset row ("Any …").
  const selectedIndex = useMemo(() => {
    const idx = options.findIndex((o) => o.value === selected);
    return idx === -1 ? 0 : idx + 1;
  }, [options, selected]);

  const pick = useCallback(
    (value: string | null) => {
      onSelect(value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onSelect],
  );

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setActiveIdx(selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  const moveTo = useCallback(
    (idx: number) => {
      setActiveIdx(idx);
      optionRefs.current[idx]?.focus();
    },
    [],
  );

  // Once open, focus lands on the active option (DOM side-effect only).
  useEffect(() => {
    if (open) optionRefs.current[activeIdx]?.focus();
  }, [open, activeIdx]);

  // Click outside closes.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onListboxKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveTo(Math.min(activeIdx + 1, options.length));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo(Math.max(activeIdx - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        moveTo(0);
        break;
      case "End":
        e.preventDefault();
        moveTo(options.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(activeIdx === 0 ? null : options[activeIdx - 1]?.value ?? null);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={styles.dropdown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${
          selected ? styles.triggerActive : ""
        }`}
      >
        <span className={styles.triggerLabel}>
          {selected ? `${label}: ${selectedLabel}` : label}
        </span>
        <svg
          aria-hidden
          className={styles.chevron}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          onKeyDown={onListboxKeyDown}
          onBlur={(e) => {
            if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
          }}
          className={`${styles.menu} ${align === "right" ? styles.menuRight : ""}`}
        >
          <li
            id={optionId(0)}
            ref={(el) => {
              optionRefs.current[0] = el;
            }}
            role="option"
            aria-selected={selected === null}
            data-active={activeIdx === 0}
            tabIndex={activeIdx === 0 ? 0 : -1}
            onClick={() => pick(null)}
            onMouseEnter={() => setActiveIdx(0)}
            className={`${styles.option} ${selected === null ? styles.optionSelected : ""}`}
          >
            <span aria-hidden className={styles.optionMark} />
            <span className={styles.optionLabel}>{allLabel ?? `Any ${label.toLowerCase()}`}</span>
          </li>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={optionId(i + 1)}
              ref={(el) => {
                optionRefs.current[i + 1] = el;
              }}
              role="option"
              aria-selected={selected === o.value}
              data-active={activeIdx === i + 1}
              tabIndex={activeIdx === i + 1 ? 0 : -1}
              onClick={() => pick(o.value)}
              onMouseEnter={() => setActiveIdx(i + 1)}
              className={`${styles.option} ${selected === o.value ? styles.optionSelected : ""}`}
            >
              <span aria-hidden className={styles.optionMark} />
              <span className={styles.optionLabel}>{o.label}</span>
              {typeof o.count === "number" && (
                <span className={styles.optionCount}>{o.count}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
