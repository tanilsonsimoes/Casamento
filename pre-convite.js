const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxthuMsSdocAZVvHPcVYQ74Kp67UjCv-TTe96V3W3nGg1VqcatHQZ5w5u_7yEiUqjv-gw/exec';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const feedback = document.getElementById('feedback');
const nameInput = document.getElementById('name');
const countdownEl = document.getElementById('countdown');
const countdownFill = document.getElementById('countdown-fill');
const orbiting = document.getElementById('orbiting');
const stars = document.getElementById('stars');
const quickRsvpBtn = document.getElementById('scroll-to-rsvp');
const rsvpPanel = document.getElementById('rsvp');
const allPanels = document.querySelectorAll('.tab-panel');

const showRsvpPanel = () => {
  allPanels.forEach((panel) => panel.classList.remove('active'));
  if (rsvpPanel) {
    rsvpPanel.classList.add('active');
  }
};

const targetDate = new Date(2026, 5, 26, 20, 30, 0);
const startWindowDate = new Date(2026, 5, 1, 0, 0, 0);
const countdownWindowMs = Math.max(1, targetDate.getTime() - startWindowDate.getTime());

const setFeedback = (message, error = false) => {
  feedback.textContent = message;
  feedback.style.color = error ? '#7a2f22' : '#1d3d70';
};

const setPanel = (id) => {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.target === id));
  panels.forEach((panel) => {
    const active = panel.id === id;
    panel.classList.toggle('active', active);
    panel.setAttribute('aria-hidden', String(!active));
  });
};

const getLuandaDateTime = () => {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'Africa/Luanda',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return fmt.format(now);
};

const sendPresence = async (response) => {
  const nome = nameInput.value.trim();
  if (!nome) {
    setFeedback('Digite seu nome para confirmar presença.', true);
    return;
  }

  const actionButtons = document.querySelectorAll('.rsvp-row button');
  actionButtons.forEach((button) => (button.disabled = true));
  setFeedback('Enviando...');

  try {
    await fetch(WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        resposta: response,
        criado_em: getLuandaDateTime(),
      }),
    });

    setFeedback('Presença registrada. Obrigada!');
    nameInput.value = '';
  } catch (err) {
    setFeedback('Não foi possível registrar agora. Tente novamente.', true);
  } finally {
    actionButtons.forEach((button) => (button.disabled = false));
  }
};

const renderCountdown = () => {
  if (!countdownEl || !countdownFill) {
    return;
  }
  const now = new Date();
  const delta = targetDate.getTime() - now.getTime();

  if (delta <= 0) {
    countdownEl.textContent = '';
    countdownFill.style.width = '0%';
    return;
  }

  const d = 24 * 60 * 60 * 1000;
  const h = 60 * 60 * 1000;
  const m = 60 * 1000;
  const days = Math.floor(delta / d);
  const hours = Math.floor((delta % d) / h);
  const mins = Math.floor((delta % h) / m);

  const elapsedFromWindow = Math.min(
    countdownWindowMs,
    Math.max(0, now.getTime() - startWindowDate.getTime())
  );
  const pct = Math.max(0, 100 - (elapsedFromWindow / countdownWindowMs) * 100);
  countdownFill.style.width = `${pct.toFixed(1)}%`;

  countdownEl.textContent = `Faltam ${days} dias ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
};

const buildScene = () => {
  for (let i = 0; i < 34; i++) {
    const dot = document.createElement('span');
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    const px = `${(Math.random() * 16 + 2).toFixed(1)}px`;
    const py = `${(-(Math.random() * 26 + 16)).toFixed(1)}px`;
    dot.style.setProperty('--x', px);
    dot.style.setProperty('--y', py);
    dot.style.animation = `drift ${5 + Math.random() * 7}s linear ${Math.random() * 4}s infinite`;
    dot.style.opacity = `${0.25 + Math.random() * 0.55}`;
    orbiting.appendChild(dot);
  }

  for (let i = 0; i < 16; i++) {
    const spark = document.createElement('span');
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${Math.random() * 100}%`;
    spark.style.opacity = `${0.25 + Math.random() * 0.6}`;
    spark.style.animation = `drift ${7 + Math.random() * 7}s linear ${Math.random() * 2}s infinite`;
    stars.appendChild(spark);
  }
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setPanel(tab.dataset.target);
  });
});

document.querySelectorAll('.rsvp-row button').forEach((button) => {
  button.addEventListener('click', () => {
    sendPresence(button.dataset.resposta);
  });
});

if (quickRsvpBtn) {
  quickRsvpBtn.addEventListener('click', () => {
    showRsvpPanel();
    const targetPanel = document.getElementById('rsvp');
    if (targetPanel) {
      targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nameInput) {
        nameInput.focus();
      }
    }
  });
}

buildScene();
if (countdownEl && countdownFill) {
  renderCountdown();
  setInterval(renderCountdown, 60000);
}
