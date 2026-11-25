// HTMLの読み込み完了後に、各ボタンのクリック処理を登録する。
document.addEventListener("DOMContentLoaded", () => {
  // 前に使った名前の一覧を取得する。
  const savedNames = JSON.parse(
    localStorage.getItem("savedNames") || "[]"
  );

  // 名前入力欄を取得する。
  const nameInput = document.querySelector("#name-input");

  // 前に使った名前を選択する欄を取得する。
  const savedNameSelect = document.querySelector("#saveName");

  // 保存済みの名前が存在するか判定する。
  const hasSavedNames = savedNames.length > 0;

  // 名前履歴表示エリアを取得する。
  const nameHistory = document.querySelector(".name-history");

  // 保存済み名前がある場合だけ選択欄を表示する。
  if (nameHistory && hasSavedNames) {
    nameHistory.hidden = false;
  }

  // 保存済み名前を選択欄に追加する。
  if (savedNameSelect) {
    savedNames.forEach((savedName) => {
      const option = document.createElement("option");
      option.value = savedName;
      option.textContent = savedName;
      savedNameSelect.appendChild(option);
    });

    // 選択した名前を入力欄へ反映する。
    savedNameSelect.addEventListener("change", () => {
      if (nameInput) {
        nameInput.value = savedNameSelect.value;
      }
    });
  }

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

    const mealDate =
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return {
      dayId,
      mealDate,
      needsMeal: null,
      mealMenu: ""
    };
  });

  // kids.htmlとmom.htmlの同じ曜日に予定日を表示する。
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

  // 保存済みデータを取得する。
  const UserName = sessionStorage.getItem("UserName") || "";

  const savedMealPlans = JSON.parse(
    localStorage.getItem("mealPlansByUserAndDate") || "[]"
  );

  const savedMealMenus = JSON.parse(
    localStorage.getItem("mealMenusByDate") || "[]"
  );

  // 献立情報の表示・保存処理
  weeklyMealPlans.forEach((plan) => {
    const dayElement = document.querySelector(`#day-${plan.dayId}`);
    if (!dayElement) return;

    const savedMenu = savedMealMenus.find(
      (item) => item.mealDate === plan.mealDate
    );

    plan.mealMenu = savedMenu ? savedMenu.mealMenu : "";

    const mealMenuElement = dayElement.querySelector(
      '[data-field="mealMenu"]'
    );

    if (!mealMenuElement) return;

    // mom画面では献立を即保存する。
    if (
      document.body.dataset.page === "mom" &&
      mealMenuElement.tagName === "INPUT"
    ) {
      mealMenuElement.value = plan.mealMenu;

      mealMenuElement.addEventListener("input", () => {
        plan.mealMenu = mealMenuElement.value;

        const existingIndex = savedMealMenus.findIndex(
          (item) => item.mealDate === plan.mealDate
        );

        const menuPlan = {
          mealDate: plan.mealDate,
          mealMenu: plan.mealMenu
        };

        if (existingIndex >= 0) {
          savedMealMenus[existingIndex] = menuPlan;
        } else {
          savedMealMenus.push(menuPlan);
        }

        localStorage.setItem(
          "mealMenusByDate",
          JSON.stringify(savedMealMenus)
        );
      });
    } else if (document.body.dataset.page === "kids") {
      mealMenuElement.textContent = plan.mealMenu || "未定";
    }
  });

  // mom.html用の表示処理
  if (document.body.dataset.page === "mom") {
    const memberPlanTemplate = document.querySelector("#member-plan");

    weeklyMealPlans.forEach((plan) => {
      const dayElement = document.querySelector(`#day-${plan.dayId}`);
      if (!dayElement) return;

      const memberList = dayElement.querySelector(".member-list");

      if (memberList) {
        memberList.replaceChildren();
      }

      const plansForDate = savedMealPlans.filter(
        (item) => item.mealDate === plan.mealDate
      );

      plansForDate.forEach((savedPlan) => {
        let memberPlan;

        if (memberPlanTemplate) {
          memberPlan = memberPlanTemplate.content.cloneNode(true);

          memberPlan.querySelector(
            '[data-field="UserName"]'
          ).textContent = savedPlan.UserName || "名前なし";

          const needsMeal = memberPlan.querySelector(
            '[data-field="needsMeal"]'
          );

          if (needsMeal) {
            needsMeal.textContent =
              savedPlan.needsMeal === true
                ? "家で食べる"
                : savedPlan.needsMeal === false
                  ? "食事不要"
                  : "無回答";
          }

          const mealNote = memberPlan.querySelector(
            '[data-field="mealNote"]'
          );

          if (mealNote) {
            mealNote.textContent = savedPlan.mealNote
              ? `備考：${savedPlan.mealNote}`
              : "";
          }
        } else {
          memberPlan = document.createElement("li");

          const planText =
            savedPlan.needsMeal === true
              ? "家で食べる"
              : savedPlan.needsMeal === false
                ? "食事不要"
                : "無回答";

          memberPlan.textContent =
            `${savedPlan.UserName || "名前なし"}：${planText}` +
            `${savedPlan.mealNote ? `（備考：${savedPlan.mealNote}）` : ""}`;
        }

        if (memberList) {
          memberList.appendChild(memberPlan);
        }
      });

      const noMealCount = plansForDate.filter(
        (item) => item.needsMeal === false
      ).length;

      const noMealCountElement = dayElement.querySelector(
        '[data-field="noMealCount"]'
      );

      if (noMealCountElement) {
        noMealCountElement.textContent = String(noMealCount);
      }
    });
  }

  // kids.html用の処理
  if (document.body.dataset.page === "kids") {
    // 保存済みデータを復元する。
    weeklyMealPlans.forEach((plan) => {
      const dayElement = document.querySelector(`#day-${plan.dayId}`);
      if (!dayElement) return;

      const savedPlan = savedMealPlans.find(
        (item) =>
          item.UserName === UserName &&
          item.mealDate === plan.mealDate
      );

      if (savedPlan) {
        const mealNote = dayElement.querySelector(
          '[data-field="mealNote"]'
        );

        if (mealNote) {
          mealNote.value = savedPlan.mealNote || "";
        }

        if (savedPlan.needsMeal !== null) {
          const needsMealInput = dayElement.querySelector(
            `[data-field="needsMeal"][value="${savedPlan.needsMeal}"]`
          );

          if (needsMealInput) {
            needsMealInput.checked = true;
          }
        }
      }
    });

    // 完了ボタン押下時に保存する。
    const addButton = document.getElementById("add-button");

    if (addButton) {
      addButton.addEventListener("click", () => {
        weeklyMealPlans.forEach((plan) => {
          const dayElement = document.querySelector(`#day-${plan.dayId}`);
          if (!dayElement) return;

          const checkedNeedsMeal = dayElement.querySelector(
            '[data-field="needsMeal"]:checked'
          );

          const mealNoteInput = dayElement.querySelector(
            '[data-field="mealNote"]'
          );

          const needsMeal = checkedNeedsMeal
            ? checkedNeedsMeal.value === "true"
            : null;

          const mealNote = mealNoteInput
            ? mealNoteInput.value
            : "";

          const existingIndex = savedMealPlans.findIndex(
            (item) =>
              item.UserName === UserName &&
              item.mealDate === plan.mealDate
          );

          const mealPlan = {
            UserName,
            mealDate: plan.mealDate,
            needsMeal,
            mealNote
          };

          if (existingIndex >= 0) {
            savedMealPlans[existingIndex] = mealPlan;
          } else {
            savedMealPlans.push(mealPlan);
          }
        });

        localStorage.setItem(
          "mealPlansByUserAndDate",
          JSON.stringify(savedMealPlans)
        );

        const registrationDialog =
          document.getElementById("registration-dialog");

        const savedAtElement =
          document.getElementById("registration-saved-at");

        if (savedAtElement) {
          savedAtElement.textContent =
            new Date().toLocaleString("ja-JP");
        }

        if (
          registrationDialog &&
          typeof registrationDialog.showModal === "function"
        ) {
          registrationDialog.showModal();
        }
      });
    }

    // OKボタン押下で最初の画面へ戻る。
    const okButton = document.querySelector(".registration-ok");

    if (okButton) {
      okButton.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }
  }

  // 名前を保存する共通処理
  const saveUserName = (UserName) => {
    if (!UserName) return;

    if (!savedNames.includes(UserName)) {
      savedNames.push(UserName);

      localStorage.setItem(
        "savedNames",
        JSON.stringify(savedNames)
      );
    }
  };

  // 「作ってもらう」ボタン
  const kidsButtons = document.querySelectorAll(
    "#kids-button, .kids-button"
  );

  kidsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const UserName = nameInput
        ? nameInput.value.trim()
        : "";

      // 名前を保存する。
      saveUserName(UserName);

      sessionStorage.setItem("UserName", UserName);
      sessionStorage.setItem("UserRole", "kids");

      window.location.href = "kids.html";
    });
  });

  // 「作る」ボタン
  const momButtons = document.querySelectorAll(
    "#mom-button, .mom-button"
  );

  momButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const UserName = nameInput
        ? nameInput.value.trim()
        : "";

      // 名前を保存する。
      saveUserName(UserName);

      sessionStorage.setItem("UserName", UserName);
      sessionStorage.setItem("UserRole", "mom");

      window.location.href = "mom.html";
    });
  });
});