// HTMLの読み込み完了後に、各ボタンのクリック処理を登録する。
document.addEventListener("DOMContentLoaded", () => {
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