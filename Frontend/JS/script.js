
function switchTab(tab) {
    const signInBtn = document.getElementById('signInTabBtn');
    const signUpBtn = document.getElementById('signUpTabBtn');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');

    if (tab === 'signIn') {
        signInBtn.classList.add('active');
        signUpBtn.classList.remove('active');

        signUpForm.classList.remove('active');
        setTimeout(() => {
            signUpForm.style.display = 'none';
            signInForm.style.display = 'flex';
            setTimeout(() => signInForm.classList.add('active'), 20);
        }, 150);
    } else {
        signUpBtn.classList.add('active');
        signInBtn.classList.remove('active');

        signInForm.classList.remove('active');
        setTimeout(() => {
            signInForm.style.display = 'none';
            signUpForm.style.display = 'flex';
            setTimeout(() => signUpForm.classList.add('active'), 20);
        }, 150);
    }
}

function handleFormSubmit(event, type) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerText;

    submitBtn.innerText = 'Processing...';
    submitBtn.style.opacity = '0.85';

    setTimeout(() => {
        submitBtn.innerText = type === 'Sign In' ? 'Success! Redirecting...' : 'Account Created!';
        submitBtn.style.background = 'linear-gradient(135deg, #00f2fe 0%, #00b894 100%)';

        setTimeout(() => {
            submitBtn.innerText = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.style.background = '';
        }, 2200);
    }, 1000);
}

const dotsContainer = document.querySelector('.dots-container');
const dotCount = 55;

for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('floating-dot');

    const size = Math.random() * 7 + 2 + 'px';
    const left = Math.random() * 100 + 'vw';
    const top = Math.random() * 100 + 'vh';
    const duration = Math.random() * 14 + 8 + 's';
    const delay = Math.random() * 6 + 's';

    const moveX = (Math.random() - 0.5) * 240 + 'px';
    const moveY = (Math.random() - 0.5) * 240 + 'px';

    dot.style.width = size;
    dot.style.height = size;
    dot.style.left = left;
    dot.style.top = top;
    dot.style.setProperty('--moveX', moveX);
    dot.style.setProperty('--moveY', moveY);
    dot.style.animationDuration = duration;
    dot.style.animationDelay = delay;

    dotsContainer.appendChild(dot);
}
