/**
 * Likkle Legends - Core Interaction Logic
 * 1. Dialect Dial Control
 * 2. 5-Interaction Lead Capture Nudge
 * 3. Heritage Data Management
 */

const islands = [
    {
        id: 'JM',
        name: 'Jamaica',
        title: 'Anansi & the Great Heat',
        dialect: '“Anansi, yuh too greedy!” Brou-brou seh, as him watch di spider try fi hide di whole pot a beans.',
        standard: '"Anansi, you are too greedy!" Brou-brou said, as he watched the spider try to hide the entire pot of beans.',
        angle: 0
    },
    {
        id: 'TT',
        name: 'Trinidad',
        title: 'Papa Bois and the Hunter',
        dialect: '“Fus leaf dat fall, is meh sign,” Papa Bois whisper, as de hunter step deep into de bush.',
        standard: '"The first leaf that falls is my sign," Papa Bois whispered, as the hunter stepped deep into the forest.',
        angle: 72
    },
    {
        id: 'HT',
        name: 'Haiti',
        title: 'Bouki ak Malice',
        dialect: '“Malice, zanmi mwen, ki sa w’ap kwit la?” Bouki mande ak yon gwo souri sou vizaj li.',
        standard: '"Malice, my friend, what are you cooking there?" Bouki asked with a big smile on his face.',
        angle: 144
    },
    {
        id: 'SL',
        name: 'Saint Lucia',
        title: 'The Compere Lapin',
        dialect: '“Lapin, sé pa konsa pou ou maché!” Ti Mamai la hélé, pandan Lapin té ka kouri vit.',
        standard: '"Rabbit, that is not how you should walk!" The little child shouted, while Rabbit was running fast.',
        angle: 216
    },
    {
        id: 'BB',
        name: 'Barbados',
        title: 'Bajan Proverbs',
        dialect: '“Evah pig got an island of he own,” de granny tell de chile, while she stirrin’ de sweet bread.',
        standard: '"Every pig has an island of his own," the grandmother told the child, while she stirred the sweet bread.',
        angle: 288
    }
];

let currentInteractionCount = 0;
const INTERACTION_LIMIT = 5;
let hasShowedModal = false;

const handle = document.getElementById('dial-handle');
const ring = document.getElementById('dial-ring');
const cardTitle = document.getElementById('story-title');
const cardDialect = document.getElementById('story-dialect');
const cardStandard = document.getElementById('story-standard');
const cardInner = document.getElementById('card-inner');
const counterDisplay = document.getElementById('interaction-counter');
const modalOverlay = document.getElementById('modal-overlay');

// Initialize Labels around the dial
function initDial() {
    islands.forEach((island) => {
        const label = document.createElement('div');
        label.className = 'island-label';
        label.innerText = island.id;
        label.id = `label-${island.id}`;

        // Position labels in a circle
        const radius = 130;
        const radian = (island.angle - 90) * (Math.PI / 180);
        const x = 150 + radius * Math.cos(radian);
        const y = 150 + radius * Math.sin(radian);

        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.style.transform = 'translate(-50%, -50%)';

        label.onclick = () => selectIsland(island);
        ring.appendChild(label);
    });

    // Set initial
    selectIsland(islands[0]);
}

function selectIsland(island) {
    // 1. Rotate Handle
    handle.style.transform = `rotate(${island.angle}deg)`;

    // 2. Update Labels
    document.querySelectorAll('.island-label').forEach(l => l.classList.remove('active'));
    document.getElementById(`label-${island.id}`).classList.add('active');

    // 3. Update Card with Typewriter Effect
    cardInner.style.opacity = 0;
    cardInner.style.transform = 'translateY(10px)';

    setTimeout(() => {
        cardTitle.innerText = island.title;
        cardStandard.innerText = island.standard;

        // Typewriter effect for Dialect
        cardDialect.innerText = '';
        let i = 0;
        const speed = 30;
        function typeWriter() {
            if (i < island.dialect.length) {
                cardDialect.innerText += island.dialect.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }

        cardInner.style.opacity = 1;
        cardInner.style.transform = 'translateY(0)';
        typeWriter();
    }, 300);

    // 4. Track Interaction
    trackInteraction();
}

function trackInteraction() {
    currentInteractionCount++;
    if (counterDisplay) {
        counterDisplay.innerText = `Interactions: ${Math.min(currentInteractionCount, INTERACTION_LIMIT)} / ${INTERACTION_LIMIT}`;
    }

    if (currentInteractionCount >= INTERACTION_LIMIT && !hasShowedModal) {
        setTimeout(showModal, 1000);
    }
}

function showModal() {
    hasShowedModal = true;
    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalOverlay.style.opacity = 1;
        modalOverlay.querySelector('.modal').style.transform = 'translateY(0)';
    }, 10);
}

function closeModal() {
    modalOverlay.style.opacity = 0;
    modalOverlay.querySelector('.modal').style.transform = 'translateY(20px)';
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 500);
}

// Handle Lead Submission
document.getElementById('lead-form').onsubmit = (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn');
    btn.innerText = 'Creating Profile...';
    btn.disabled = true;

    // Mocking the write to DB for now
    setTimeout(() => {
        btn.innerText = 'Success! Welcome Home.';
        btn.style.background = '#009B77';
        setTimeout(() => {
            closeModal();
            alert('Welcome to Likkle Legends! Your heritage track has been secured.');
        }, 1500);
    }, 2000);
};

// Start
initDial();
