const roomsData = {
  deluxe: {
    titleKey: 'rooms.deluxe.title',
    descKey: 'rooms.deluxe.full',
    photos: [
      'assets/Deluxe%20Room/Deluxe-new.webp',
      'assets/Deluxe%20Room/Deluxe%20room%20New%20part.webp',
      'assets/Deluxe%20Room/new.webp',
      'assets/Deluxe%20Room/new%20block%20entrance%20.webp',
      'assets/Deluxe%20Room/new%20block%20night%20view.webp',
      'assets/Deluxe%20Room/pool.webp',
      'assets/Deluxe%20Room/beautiparlour.webp',
    ],
  },
  cottage: {
    titleKey: 'rooms.cottage.title',
    descKey: 'rooms.cottage.full',
    photos: [
      'assets/Kerala%20Cottages/cottage.webp',
      'assets/Kerala%20Cottages/Villa.webp',
      'assets/Kerala%20Cottages/villa%201.webp',
      'assets/Kerala%20Cottages/cottage%20BEDROOM.webp',
      'assets/Kerala%20Cottages/villa%20bed.webp',
      'assets/Kerala%20Cottages/villa%20beds.webp',
      'assets/Kerala%20Cottages/new%20cottage%202%20fl.webp',
      'assets/Kerala%20Cottages/P_20180130_172323.webp',
      'assets/Kerala%20Cottages/P_20180130_172817.webp',
      'assets/Kerala%20Cottages/P_20180130_172852.webp',
    ],
  },
  standard: {
    titleKey: 'rooms.standard.title',
    descKey: 'rooms.standard.full',
    photos: [
      'assets/Standard%20Room/std%20room.webp',
      'assets/Standard%20Room/standard%20Room.webp',
      'assets/Standard%20Room/standard.webp',
      'assets/Standard%20Room/103.webp',
      'assets/Standard%20Room/STD%20Room%20.webp',
      'assets/Standard%20Room/P_20180130_173307.webp',
    ],
  },
};

const modal = document.getElementById('roomModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalGallery = document.getElementById('modalGallery');

function openRoom(roomId) {
  const data = roomsData[roomId];
  if (!data) return;

  modalTitle.textContent = t(data.titleKey);
  modalDesc.textContent = t(data.descKey);

  modalGallery.innerHTML = data.photos
    .map((src, i) => `<figure class="modal__photo${i === 0 ? ' modal__photo--wide' : ''}"><img src="${src}" alt="" loading="lazy"></figure>`)
    .join('');

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.classList.add('modal--open'));
}

function closeRoom() {
  modal.classList.remove('modal--open');
  document.body.style.overflow = '';
  setTimeout(() => {
    modal.hidden = true;
    modalGallery.innerHTML = '';
  }, 250);
}

document.querySelectorAll('.room[data-room]').forEach(btn => {
  btn.addEventListener('click', () => openRoom(btn.dataset.room));
});

modal.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closeRoom();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeRoom();
});
