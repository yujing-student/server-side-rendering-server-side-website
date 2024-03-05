function ShowHamburgerMenu () {/*hamburger menu*/
    let button = document.querySelector('.hamburger-icon');/*select icon hamburger*/
    let menu = document.querySelector('.menu-ul');

    button.addEventListener('click', () => {/*clickfunction*/
        menu.classList.toggle('menu-ul-open');/*open the menue*/

    });
}