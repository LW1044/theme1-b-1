// HTMLの読み込み完了後に、各ボタンのクリック処理を登録する。
document.addEventListener("DOMContentLoaded", () => {
  // kids.htmlでは、index.htmlで保存した入力者名を表示する。
  const greetingName = document.querySelector('[data-field="UserName"]');
  if (greetingName) {
    const UserName = sessionStorage.getItem("UserName") || "";
    greetingName.textContent = UserName;
  }

  // 今日を含む1週間の月曜日から日曜日を作成する。
  const today = new Date();
  const monday = new Date(today);
  const offsetFromMonday = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - offsetFromMonday);

  const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const weeklyMealPlans = dayIds.map((dayId, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const mealDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return {
      dayId,
      mealDate,
      needsMeal: null,
      mealMenu: ""
    };
  });

  // kids.htmlとmom.htmlの同じ曜日に、予定の日付を表示する。
  weeklyMealPlans.forEach((plan) => {
    const dayElement = document.querySelector(`#day-${plan.dayId}`);
    const mealDateElement = dayElement
      ? dayElement.querySelector('[data-field="mealDate"]')
      : null;

    if (mealDateElement) {
      const [, month, day] = plan.mealDate.split("-");
      mealDateElement.textContent = `${month}/${day}`;
    }
  });

  // 名前と日付ごとの食事予定をブラウザに保存し、開き直したときに復元する。
  const UserName = sessionStorage.getItem("UserName") || "";
  const savedMealPlans = JSON.parse(localStorage.getItem("mealPlansByUserAndDate") || "[]");
  const savedMealMenus = JSON.parse(localStorage.getItem("mealMenusByDate") || "[]");

  weeklyMealPlans.forEach((plan) => {
    const dayElement = document.querySelector(`#day-${plan.dayId}`);
    if (!dayElement) return;

    const savedMenu = savedMealMenus.find((item) => item.mealDate === plan.mealDate);
    plan.mealMenu = savedMenu ? savedMenu.mealMenu : "";

    const mealMenuElement = dayElement.querySelector('[data-field="mealMenu"]');
    if (!mealMenuElement) return;

    if (document.body.dataset.page === "mom" && mealMenuElement.tagName === "INPUT") {
      mealMenuElement.value = plan.mealMenu;

      mealMenuElement.addEventListener("input", () => {
        plan.mealMenu = mealMenuElement.value;

        const existingIndex = savedMealMenus.findIndex((item) =>
          item.mealDate === plan.mealDate
        );
        const menuPlan = { mealDate: plan.mealDate, mealMenu: plan.mealMenu };

        if (existingIndex >= 0) {
          savedMealMenus[existingIndex] = menuPlan;
        } else {
          savedMealMenus.push(menuPlan);
        }

        localStorage.setItem("mealMenusByDate", JSON.stringify(savedMealMenus));
      });
    } else if (document.body.dataset.page === "kids") {
      mealMenuElement.textContent = plan.mealMenu || "未定";
    }
  });

  if (document.body.dataset.page === "mom") {
    const memberPlanTemplate = document.querySelector("#member-plan");

    weeklyMealPlans.forEach((plan) => {
      const dayElement = document.querySelector(`#day-${plan.dayId}`);
      if (!dayElement) return;

      const memberList = dayElement.querySelector(".member-list");
      if (memberList) memberList.replaceChildren();

      const plansForDate = savedMealPlans.filter((item) =>
        item.mealDate === plan.mealDate
      );

      plansForDate.forEach((savedPlan) => {
        let memberPlan;

        if (memberPlanTemplate) {
          memberPlan = memberPlanTemplate.content.cloneNode(true);
          memberPlan.querySelector('[data-field="UserName"]').textContent = savedPlan.UserName || "名前なし";

          const needsMeal = memberPlan.querySelector('[data-field="needsMeal"]');
          if (needsMeal) {
            needsMeal.textContent = savedPlan.needsMeal === true
              ? "家で食べる"
              : savedPlan.needsMeal === false
                ? "食事不要"
                : "無回答";
          }

          const mealNote = memberPlan.querySelector('[data-field="mealNote"]');
          if (mealNote) mealNote.textContent = savedPlan.mealNote ? `備考：${savedPlan.mealNote}` : "";
        } else {
          memberPlan = document.createElement("li");
          const planText = savedPlan.needsMeal === true
            ? "家で食べる"
            : savedPlan.needsMeal === false
              ? "食事不要"
              : "無回答";
          memberPlan.textContent = `${savedPlan.UserName || "名前なし"}：${planText}${savedPlan.mealNote ? `（備考：${savedPlan.mealNote}）` : ""}`;
        }

        if (memberList) memberList.appendChild(memberPlan);
      });

      const noMealCount = plansForDate.filter((item) => item.needsMeal === false).length;
      const noMealCountElement = dayElement.querySelector('[data-field="noMealCount"]');
      if (noMealCountElement) noMealCountElement.textContent = String(noMealCount);
    });
  }

  if (document.body.dataset.page === "kids") {
    weeklyMealPlans.forEach((plan) => {
      const dayElement = document.querySelector(`#day-${plan.dayId}`);
      if (!dayElement) return;

      const savedPlan = savedMealPlans.find((item) =>
        item.UserName === UserName && item.mealDate === plan.mealDate
      );

      if (savedPlan) {
        const mealNote = dayElement.querySelector('[data-field="mealNote"]');
        if (mealNote) mealNote.value = savedPlan.mealNote || "";

        if (savedPlan.needsMeal !== null) {
          const needsMealInput = dayElement.querySelector(
            `[data-field="needsMeal"][value="${savedPlan.needsMeal}"]`
          );
          if (needsMealInput) needsMealInput.checked = true;
        }
      }

      const savePlan = () => {
        const checkedNeedsMeal = dayElement.querySelector('[data-field="needsMeal"]:checked');
        const mealNoteInput = dayElement.querySelector('[data-field="mealNote"]');
        const needsMeal = checkedNeedsMeal
          ? checkedNeedsMeal.value === "true"
          : null;
        const mealNote = mealNoteInput ? mealNoteInput.value : "";

        const existingIndex = savedMealPlans.findIndex((item) =>
          item.UserName === UserName && item.mealDate === plan.mealDate
        );
        const mealPlan = { UserName, mealDate: plan.mealDate, needsMeal, mealNote };

        if (existingIndex >= 0) {
          savedMealPlans[existingIndex] = mealPlan;
        } else {
          savedMealPlans.push(mealPlan);
        }

        localStorage.setItem("mealPlansByUserAndDate", JSON.stringify(savedMealPlans));
      };

      dayElement.querySelectorAll('[data-field="needsMeal"]').forEach((input) => {
        input.addEventListener("change", savePlan);
      });

      const mealNoteInput = dayElement.querySelector('[data-field="mealNote"]');
      if (mealNoteInput) {
        mealNoteInput.addEventListener("input", savePlan);
      }
    });
  }

  // 「作ってもらう」ボタンをIDまたはクラス名から取得する。
  const kidsButtons = document.querySelectorAll("#kids-button, .kids-button");

  // 子ども側ボタンそれぞれに、名前の保存と画面移動の処理を登録する。
  kidsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 名前入力欄を取得し、前後の空白を削除した名前を作る。
      const nameInput = document.querySelector("#name-input, .name-input");
      const UserName = nameInput ? nameInput.value.trim() : "";

      // 名前と役割をブラウザのsessionStorageに保存する。
      sessionStorage.setItem("UserName", UserName);
      sessionStorage.setItem("UserRole", "kids");

      // 子ども側のページへ移動する。
      window.location.href = "kids.html";
    });
  });

  // 「作る」ボタンをIDまたはクラス名から取得する。
  const momButtons = document.querySelectorAll("#mom-button, .mom-button");

  // 母側ボタンそれぞれに、名前の保存と画面移動の処理を登録する。
  momButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 名前入力欄を取得し、前後の空白を削除した名前を作る。
      const nameInput = document.querySelector("#name-input, .name-input");
      const UserName = nameInput ? nameInput.value.trim() : "";

      // 名前と役割をブラウザのsessionStorageに保存する。
      sessionStorage.setItem("UserName", UserName);
      sessionStorage.setItem("UserRole", "mom");

      // 母側のページへ移動する。
      window.location.href = "mom.html";
    });
  });
});