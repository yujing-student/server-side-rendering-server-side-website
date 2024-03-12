function ShowHamburgerMenu () {/*hamburger menu*/
    const button = document.querySelector('.hamburger-icon');/*select icon hamburger*/
    const menu = document.querySelector('.menu-ul');
    const header = document.querySelector('.header-menu');

    button.addEventListener('click', () => {/*clickfunction*/
        menu.classList.toggle('menu-ul-open');/*open the menue*/
        header.classList.toggle('header-menu-open')

    });
}
ShowHamburgerMenu();


const favoriteButton = document.getElementsByClassName(".favoriteButton");
favoriteButton.addEventListener("click", () => {
    // Your code to handle the click event (e.g., navigate to a page)
    window.location.href = "favorite-list/"; // Replace with your desired URL
});