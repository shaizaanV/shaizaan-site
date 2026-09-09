import type { InventoryItem } from "./data";

export function renderInventory(container: HTMLElement, items: InventoryItem[]): void {
  container.innerHTML = "";

  for (const item of items) {
    const slot = document.createElement("li");
    slot.className = "inventory-slot";
    slot.tabIndex = 0;

    const icon = document.createElement("span");
    icon.className = "inventory-slot__icon";
    icon.textContent = item.icon;

    const label = document.createElement("span");
    label.className = "inventory-slot__label";
    label.textContent = item.label;

    slot.append(icon, label);
    container.appendChild(slot);
  }
}
