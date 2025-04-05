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

const themeSwitch = document.querySelector('.theme-switch');
const themeIcons = themeSwitch?.querySelectorAll('svg');

const switchThemeIcon = () => {
    themeIcons?.forEach(icon => {
        icon.classList.toggle('hidden');
        if (!(icon.classList.contains('hidden')))
            themeSwitch.setAttribute('aria-label', icon.getAttribute('button-label'));
    });
}

if (htmlElement.hasAttribute('dark-mode'))
    switchThemeIcon();

//  themeSwitch?.setAttribute('tabindex', '0');
// themeSwitch?.addEventListener('keydown', (event) => {
//     if (event?.key === 'Enter') {
//         themeSwitch.click();
//     }
// });

themeSwitch?.addEventListener('click', () => {
    htmlElement.toggleAttribute('dark-mode');

    switchThemeIcon();
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

    skillsSorted.forEach((skill, skillIndex) => {
        skills[skillIndex].replaceWith(skill);
        
        if (skill.hasAttribute('sub-skills'))
        {
            skill.setAttribute('tabindex', '0');
            skill.setAttribute('aria-label', `${skill.textContent} (contains sub-skills)`);
            skill.setAttribute('aria-expanded', 'false');
            skill.addEventListener('keydown', (event) => {
                if (event?.key === 'Enter') {
                    skill.click();
                }
            });

            const subSkills = [];
            const subSkillNames = skill.getAttribute('sub-skills').split(';');
            subSkillNames.sort();
            
            subSkillNames.forEach((subSkillText, subIndex) => {
                const subSkill = document.createElement('li');
                subSkill.textContent = subSkillText;
                subSkill.setAttribute('sub-skill', '');
                const id = `skill-${skillIndex}-${subIndex}`;
                subSkill.setAttribute('id', id);
                skill.setAttribute('aria-controls',
                    `${skill.getAttribute('aria-controls') ?? ''}${subIndex ? ' ' : ''}${id}`);
                subSkill.style.setProperty('display', 'none');
                skillList.insertBefore(subSkill, 
                    subSkills.length ?
                    subSkills[subSkills.length - 1].nextElementSibling :
                    skill.nextElementSibling);
                subSkills.push(subSkill);
            });
        
            skill.addEventListener('click', () => {
                skill.toggleAttribute('skill-selected');
                skill.setAttribute('aria-expanded', skill.hasAttribute('skill-selected'));

                if (skill.hasAttribute('skill-selected')) {
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
    });
}