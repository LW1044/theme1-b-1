document.addEventListener("DOMContentLoaded", () => {
  const kidsButtons = document.querySelectorAll("#kids-button, .kids-button");

  kidsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nameInput = document.querySelector("#name-input, .name-input");
      const name = nameInput ? nameInput.value : "";
      window.location.href = `kids.html?name=${encodeURIComponent(name)}`;
    });
  });

  const momButtons = document.querySelectorAll("#mom-button, .mom-button");

  momButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nameInput = document.querySelector("#name-input, .name-input");
      const name = nameInput ? nameInput.value : "";
      window.location.href = `mom.html?name=${encodeURIComponent(name)}`;
    });
  });
});
