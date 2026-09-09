import type { DataBankLog } from "./data";

export function renderDataBank(
  tabsContainer: HTMLElement,
  panelsContainer: HTMLElement,
  logs: DataBankLog[]
): void {
  tabsContainer.innerHTML = "";
  panelsContainer.innerHTML = "";

  logs.forEach((log, index) => {
    const isActive = index === 0;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "databank__tab";
    tab.id = `tab-${log.id}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `panel-${log.id}`);
    tab.setAttribute("aria-selected", String(isActive));
    tab.textContent = `${log.emoji} ${log.title}`;

    const panel = document.createElement("div");
    panel.className = "databank__panel";
    panel.id = `panel-${log.id}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.dataset.active = String(isActive);

    for (const entry of log.entries) {
      const item = document.createElement("div");
      item.className = "databank__entry";
      item.textContent = entry;
      panel.appendChild(item);
    }

    tab.addEventListener("click", () => activateTab(tabsContainer, panelsContainer, log.id));

    tabsContainer.appendChild(tab);
    panelsContainer.appendChild(panel);
  });
}

function activateTab(
  tabsContainer: HTMLElement,
  panelsContainer: HTMLElement,
  activeId: string
): void {
  tabsContainer.querySelectorAll<HTMLButtonElement>(".databank__tab").forEach((tab) => {
    const isActive = tab.id === `tab-${activeId}`;
    tab.setAttribute("aria-selected", String(isActive));
  });

  panelsContainer.querySelectorAll<HTMLDivElement>(".databank__panel").forEach((panel) => {
    const isActive = panel.id === `panel-${activeId}`;
    panel.dataset.active = String(isActive);
  });
}
