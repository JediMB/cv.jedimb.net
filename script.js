const languageSelectors = Array.from(document.querySelectorAll('[select-language]'));
const htmlElement  = document.querySelector('html');
let userLanguage = window.navigator.userLanguage || window.navigator.language;

// Could execute the code that sets the language from the page head, so it runs before the entire DOM is loaded
// Seems unnecessary for a basic resume page, though. Implementing a CSS fade-in instead!
if (languageSelectors.find(lang => lang.getAttribute('select-language') === userLanguage))
    htmlElement.setAttribute('lang', userLanguage);

languageSelectors?.forEach(selector => {
    const language = selector.getAttribute('select-language');
    selector.disabled = language === htmlElement?.getAttribute('lang');
    selector.setAttribute('tabindex', '0');

    selector.addEventListener('click', () => {
        htmlElement.setAttribute('lang', language);

        languageSelectors.forEach(selector2 => selector2.disabled = false);
        selector.disabled = true;
    });
});

const themeSwitch = document.querySelector('theme-switch');
const themeIcons = themeSwitch?.querySelectorAll('svg');

if (htmlElement.hasAttribute('dark-mode'))
    themeIcons?.forEach(icon => icon.classList.toggle('hidden'));

themeSwitch?.setAttribute('tabindex', '0');
themeSwitch?.addEventListener('keydown', (event) => {
    if (event?.key === 'Enter') {
        themeSwitch.click();
    }
});

themeSwitch?.addEventListener('click', () => {
    htmlElement.toggleAttribute('dark-mode');

    themeIcons?.forEach(icon => icon.classList.toggle('hidden'));
});

const toggles = Array.from(document.querySelectorAll('[details-toggle]'));
const toggleCount = toggles.length;
let toggleClicked = false;

if (toggles && toggleCount > 0) {
    let index = -1;

    const bounceAnotherOne = () => {
        const prevIndex = index;

        while (index === prevIndex)
            index = Math.round(Math.random() * (toggleCount - 1));

        const delay = (3 + Math.round(Math.random() * 7)) + 's'
        const entry = toggles[index].parentElement;
        
        entry.style.setProperty('--details-animation-delay', delay);
        entry.setAttribute('details-bounce', null);
    }

    toggles.forEach(toggle => {
        toggle.addEventListener('keydown', (event) => {
            if (event?.key === 'Enter') {
                toggle.click();
            }
        });

        toggle.addEventListener('click', () => {
            const details = toggle.nextElementSibling;
            
            if (!details)
                return;

            toggleClicked = true;

            if (details.hasAttribute('details-hidden')) {
                toggle.setAttribute('aria-expanded', 'true');
                details.setAttribute('aria-hidden', 'false');
                details.removeAttribute('details-hidden');
                return;
            }

            details.setAttribute('details-hiding', null);
            details.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');

            details.addEventListener('animationend', () => {
                details.setAttribute('details-hidden', null);
                details.removeAttribute('details-hiding');
            }, { once: true });
        });

        const parent = toggle.parentElement;
        parent.addEventListener('animationend', (event) => {
            if (event.animationName !== 'bounce-x')
                return;

            parent.style.removeProperty('animationend');
            parent.removeAttribute('details-bounce');

            if (toggleCount < 2 || toggleClicked)
                return; // Only bounce once if there aren't 2 or more entries
            
            bounceAnotherOne();
        });
    });
    
    bounceAnotherOne();
}

const skillList = document.querySelector('.skills ul');
const skills = Array.from(document.querySelectorAll('.skills ul li'));

if (skills && skills.length > 1) {
    const skillsSorted = skills.map(skill => skill.cloneNode(true));
    skillsSorted.sort((a, b) => a.textContent.localeCompare(b.textContent));

    for (let i = 0; i < skills.length; i++) {
        skills[i].replaceWith(skillsSorted[i]);
        
        if (skillsSorted[i].hasAttribute('sub-skills'))
        {
            skillsSorted[i].setAttribute('tabindex', '0');
            skillsSorted[i].setAttribute('aria-label', `${skillsSorted[i].textContent} (contains sub-skills)`);
            skillsSorted[i].addEventListener('keydown', (event) => {
                if (event?.key === 'Enter') {
                    skillsSorted[i].click();
                }
            });

            const subSkills = [];
            const subSkillNames = skillsSorted[i].getAttribute('sub-skills').split(';');
            subSkillNames.sort();
            
            subSkillNames.forEach(subSkillText => {
                const subSkill = document.createElement('li');
                subSkill.textContent = subSkillText;
                subSkill.setAttribute('sub-skill', null);
                subSkill.style.setProperty('display', 'none');
                skillList.insertBefore(subSkill, 
                    subSkills.length ?
                    subSkills[subSkills.length - 1].nextElementSibling :
                    skillsSorted[i].nextElementSibling);
                subSkills.push(subSkill);
            });
        
            skillsSorted[i].addEventListener('click', () => {
                skillsSorted[i].toggleAttribute('skill-selected');

                if (skillsSorted[i].hasAttribute('skill-selected')) {
                    subSkills.forEach(subSkill => {
                        subSkill.style.removeProperty('display');
                    });
                    return;
                }

                subSkills.forEach(subSkill => {
                    subSkill.style.setProperty('display', 'none');
                });
            });
        }
    }
}