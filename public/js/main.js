const revealElements = document.querySelectorAll(".reveal");

revealElements.forEach((element, index) => {
  element.style.animationDelay = `${index * 70}ms`;
});
