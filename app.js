
  // ------------------- DATA MODELS -------------------
  const destinationsData = [
    { id: "paris", name: "Paris", cost: 820, emoji: "🗼" },
    { id: "tokyo", name: "Tokyo", cost: 1150, emoji: "🗾" },
    { id: "nyc", name: "New York", cost: 680, emoji: "🗽" },
    { id: "bali", name: "Bali", cost: 540, emoji: "🌴" },
    { id: "london", name: "London", cost: 890, emoji: "🇬🇧" },
    { id: "rome", name: "Rome", cost: 760, emoji: "🍝" }
  ];

  const activitiesData = [
    { id: "city_tour", name: "City Highlights Tour", cost: 85 },
    { id: "museum", name: "Museum Pass & Art Walk", cost: 45 },
    { id: "cooking", name: "Local Cooking Class", cost: 110 },
    { id: "hiking", name: "Guided Hiking Adventure", cost: 65 },
    { id: "beach_day", name: "Beach & Snorkeling Day", cost: 55 }
  ];

  // State
  let selectedDestinations = new Set();   // stores destination ids
  let addedActivities = new Set();        // stores activity ids (each activity can be added only once)

  // DOM Elements
  const destinationsContainer = document.getElementById("destinationsContainer");
  const activitiesListEl = document.getElementById("activitiesList");
  const selectedDestinationsArea = document.getElementById("selectedDestinationsArea");
  const itineraryListContainer = document.getElementById("itineraryListContainer");
  const totalBudgetSpan = document.getElementById("totalBudget");

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const dateValidationMsg = document.getElementById("dateValidationMsg");

  // helper: get today's date in YYYY-MM-DD
  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ----- date validation + realtime -----
  function validateDates() {
    const start = startDateInput.value;
    const end = endDateInput.value;
    if (!start && !end) {
      dateValidationMsg.innerHTML = "📅 Pick your travel dates";
      return true;
    }
    if (!start) {
      dateValidationMsg.innerHTML = "⚠️ Please select a start date";
      return false;
    }
    if (!end) {
      dateValidationMsg.innerHTML = "⚠️ Please select an end date";
      return false;
    }
    if (new Date(start) > new Date(end)) {
      dateValidationMsg.innerHTML = "❌ End date must be after or equal to start date.";
      return false;
    }
    dateValidationMsg.innerHTML = "✅ Valid dates! Ready to plan.";
    return true;
  }

  // set min dates
  function initDatePickers() {
    const today = getTodayDate();
    startDateInput.setAttribute("min", today);
    startDateInput.addEventListener("change", () => {
      if (startDateInput.value) {
        endDateInput.setAttribute("min", startDateInput.value);
      }
      validateDates();
    });
    endDateInput.addEventListener("change", validateDates);
    // default example dates (recommended: start tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    startDateInput.value = `${yyyy}-${mm}-${dd}`;
    const endDefault = new Date(tomorrow);
    endDefault.setDate(tomorrow.getDate() + 5);
    const eyyyy = endDefault.getFullYear();
    const emm = String(endDefault.getMonth() + 1).padStart(2, '0');
    const edd = String(endDefault.getDate()).padStart(2, '0');
    endDateInput.value = `${eyyyy}-${emm}-${edd}`;
    endDateInput.setAttribute("min", startDateInput.value);
    validateDates();
  }

  // ----- BUDGET CALCULATION -----
  function calculateBudget() {
    let destTotal = 0;
    for (let destId of selectedDestinations) {
      const dest = destinationsData.find(d => d.id === destId);
      if (dest) destTotal += dest.cost;
    }
    let activityTotal = 0;
    for (let actId of addedActivities) {
      const act = activitiesData.find(a => a.id === actId);
      if (act) activityTotal += act.cost;
    }
    const total = destTotal + activityTotal;
    totalBudgetSpan.innerText = `$${total.toLocaleString()}`;
  }

  // ----- RENDER SELECTED DESTINATIONS (chips + removable) -----
  function renderSelectedDestinations() {
    const selectedIds = Array.from(selectedDestinations);
    if (selectedIds.length === 0) {
      selectedDestinationsArea.innerHTML = `<div class="empty-message">🌍 No destinations selected yet</div>`;
      return;
    }
    selectedDestinationsArea.innerHTML = "";
    selectedIds.forEach(id => {
      const dest = destinationsData.find(d => d.id === id);
      if (!dest) return;
      const chip = document.createElement("div");
      chip.className = "dest-chip";
      chip.innerHTML = `${dest.emoji || "📍"} ${dest.name} <i class="fas fa-times-circle" data-id="${dest.id}" title="Remove destination"></i>`;
      selectedDestinationsArea.appendChild(chip);
    });
    // attach remove event to each X icon
    document.querySelectorAll(".dest-chip i").forEach(icon => {
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        const destId = icon.getAttribute("data-id");
        if (destId && selectedDestinations.has(destId)) {
          selectedDestinations.delete(destId);
          // sync checkbox state
          const checkbox = document.querySelector(`input.dest-checkbox[data-id="${destId}"]`);
          if (checkbox) checkbox.checked = false;
          renderSelectedDestinations();
          updateBudgetAndReflect();
        }
      });
    });
  }

  // ----- RENDER ITINERARY (added activities) + remove handler -----
  function renderItinerary() {
    const activitiesArray = Array.from(addedActivities);
    if (activitiesArray.length === 0) {
      itineraryListContainer.innerHTML = `<div class="empty-message">✏️ Your activity list is empty — add some adventures!</div>`;
      return;
    }
    itineraryListContainer.innerHTML = "";
    activitiesArray.forEach(actId => {
      const activity = activitiesData.find(a => a.id === actId);
      if (!activity) return;
      const itemDiv = document.createElement("div");
      itemDiv.className = "itinerary-item";
      itemDiv.innerHTML = `
        <span><i class="fas fa-walking"></i> ${activity.name}  <span style="font-size:0.7rem; color:#3b7a9a;">+$${activity.cost}</span></span>
        <button class="remove-activity" data-id="${activity.id}"><i class="fas fa-trash-alt"></i></button>
      `;
      itineraryListContainer.appendChild(itemDiv);
    });
    // attach remove listeners
    document.querySelectorAll(".remove-activity").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const actId = btn.getAttribute("data-id");
        if (actId && addedActivities.has(actId)) {
          addedActivities.delete(actId);
          // re-render activities list (enable add button) and itinerary
          renderAvailableActivities();
          renderItinerary();
          updateBudgetAndReflect();
        }
      });
    });
  }

  // update budget + re-render destination chips & itinerary (already called)
  function updateBudgetAndReflect() {
    calculateBudget();
    renderSelectedDestinations();
    renderItinerary();
  }

  // ----- RENDER DESTINATIONS (Checkbox list, reflecting selectedDestinations set)-----
  function renderDestinations() {
    destinationsContainer.innerHTML = "";
    destinationsData.forEach(dest => {
      const card = document.createElement("label");
      card.className = "dest-card";
      const isChecked = selectedDestinations.has(dest.id);
      card.innerHTML = `
        <input type="checkbox" class="dest-checkbox" data-id="${dest.id}" ${isChecked ? "checked" : ""}>
        <div class="dest-info">
          <div class="dest-name">${dest.emoji || "🏝️"} ${dest.name}</div>
          <div class="dest-price">+$${dest.cost}</div>
        </div>
      `;
      const checkbox = card.querySelector(".dest-checkbox");
      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        if (checkbox.checked) {
          selectedDestinations.add(dest.id);
        } else {
          selectedDestinations.delete(dest.id);
        }
        renderSelectedDestinations();
        calculateBudget();
        renderItinerary();   // budget updated but itinerary unchanged, still fine UI
      });
      destinationsContainer.appendChild(card);
    });
    // after any external change
    renderSelectedDestinations();
    calculateBudget();
  }

  // ----- RENDER AVAILABLE ACTIVITIES (with dynamic Add button / disabled if already added)-----
  function renderAvailableActivities() {
    activitiesListEl.innerHTML = "";
    activitiesData.forEach(activity => {
      const isAlreadyAdded = addedActivities.has(activity.id);
      const activityDiv = document.createElement("div");
      activityDiv.className = "activity-item";
      activityDiv.innerHTML = `
        <div class="activity-info">
          <span class="activity-name">${activity.name}</span>
          <span class="activity-cost">💰 $${activity.cost}</span>
        </div>
        <button class="add-activity-btn" data-id="${activity.id}" ${isAlreadyAdded ? "disabled" : ""}>
          ${isAlreadyAdded ? '<i class="fas fa-check"></i> Added' : '<i class="fas fa-plus"></i> Add'}
        </button>
      `;
      const addBtn = activityDiv.querySelector(".add-activity-btn");
      if (!isAlreadyAdded) {
        addBtn.addEventListener("click", (e) => {
          e.preventDefault();
          if (!addedActivities.has(activity.id)) {
            addedActivities.add(activity.id);
            renderAvailableActivities();    // re-render to disable add button
            renderItinerary();
            calculateBudget();
          }
        });
      }
      activitiesListEl.appendChild(activityDiv);
    });
  }

  // reset redundant effects: sync on load
  function syncAll() {
    renderDestinations();
    renderAvailableActivities();
    renderSelectedDestinations();
    renderItinerary();
    calculateBudget();
    initDatePickers();
  }

  // event delegation for any dynamic remove from destination-area handled in renderSelectedDestinations (live)
  // and activity removal already done in itinerary render listener.
  // also ensure budget updates when removing from destination chips and checkboxes sync already.
  window.addEventListener("DOMContentLoaded", () => {
    syncAll();
    // additional date validation re-run on any budget update? just keep validated.
    startDateInput.addEventListener("change", validateDates);
    endDateInput.addEventListener("change", validateDates);
    validateDates();
  });