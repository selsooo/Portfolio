document.addEventListener('DOMContentLoaded', () => {



    /* ───────── GESTION FENÊTRE MODALE (Popup) ───────── */
    const modalOverlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('close-btn');
    const modalWindowContent = document.querySelector('.modal-window .content'); // Conteneur principal
    const modalHeaderTitle = document.getElementById('modal-title-header'); // Titre dans la barre bleue

    // On sauvegarde la structure HTML originale de la modale (pour pouvoir la remettre après avoir utilisé le mode Navigateur)
    // Si la modale n'existe pas sur la page, on évite d'accéder à `innerHTML` pour prévenir une erreur
    const defaultModalHTML = modalWindowContent ? modalWindowContent.innerHTML : '';

    let lastFocusedElementBeforeModal = null;

    /* --- PARTIE 1 : CARROUSEL (Compétences) --- */
    const track = document.getElementById('track');

    if (track) {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const cards = document.querySelectorAll('.skill-card');

        if (cards.length > 0) {
            const cardWidth = cards[0].offsetWidth + 20; 
            if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left: cardWidth, behavior: 'smooth' }));
            if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
        }

        cards.forEach(card => {
            card.addEventListener('click', () => {
                if (!modalWindowContent) return; // nothing to do if modal markup is missing

                // 1. On remet le contenu par défaut (au cas où on vient du mode navigateur)
                modalWindowContent.innerHTML = defaultModalHTML;

                // 2. Récupération des données
                const iconBox = card.querySelector('.icon-box');
                const iconHTML = iconBox ? iconBox.innerHTML : '';
                const titleElem = card.querySelector('h3');
                const titleText = titleElem ? titleElem.innerText : 'Détail';
                const detailText = card.getAttribute('data-detail');

                // 3. Sélection des éléments (ils existent maintenant qu'on a remis le HTML par défaut)
                const mIcon = document.getElementById('modal-icon');
                const mTitle = document.getElementById('modal-title');
                const mDesc = document.getElementById('modal-desc');
                const mLink = document.getElementById('modal-link');

                // 4. Injection des données
                if (modalHeaderTitle) modalHeaderTitle.innerText = "DETAIL.EXE";
                if (mIcon) mIcon.innerHTML = iconHTML;
                if (mTitle) mTitle.innerText = titleText;
                
                // MODIFICATION ICI : Utilisation de innerHTML pour permettre le gras et les sauts de ligne
                if (mDesc) mDesc.innerHTML = detailText ? detailText : "Pas de description.";
                
                if (mLink) mLink.style.display = "none";

                openModal();
            });
        });
    }

    /* --- PARTIE 2 : EXPLORATEUR (Projets) --- */
    const fileItems = document.querySelectorAll('.file-item');

    if (fileItems.length > 0) {
        fileItems.forEach(file => {
            file.addEventListener('click', () => {
                const title = file.getAttribute('data-title') || 'Projet';
                const desc = file.getAttribute('data-desc') || '';
                const link = file.getAttribute('data-link') || '';
                const type = file.getAttribute('data-type'); // Nouveau : pour détecter le mode "browser"
                const iconElem = file.querySelector('.file-icon');
                const iconHTML = iconElem ? iconElem.outerHTML : '';

                // --- CAS SPÉCIAL : MODE NAVIGATEUR (Pour Classroom DJ) ---
                if (type === 'browser') {
                    if (!modalWindowContent) return;
                    if (modalHeaderTitle) modalHeaderTitle.innerText = "Internet Explorer - " + title;

                    // NOUVEAU : On enlève le padding (marges) pour que le site prenne toute la place
                    modalWindowContent.style.padding = "0";
                    modalWindowContent.style.height = "100%"; // On force la hauteur

                    // On remplace tout le contenu par une fausse interface de navigateur + Iframe
                    // NOUVEAU : J'ai augmenté la hauteur de l'iframe à 500px pour éviter les barres de défilement
                    modalWindowContent.innerHTML = `
                        <div style="background:#d4d4d4; padding:5px; border-bottom:1px solid #999; font-family:'Courier New'; display:flex; gap:10px; align-items:center; height: 40px;">
                            <span>Adresse:</span>
                            <input type="text" value="http://www.selsabil.com/${link}" style="flex:1; border:1px inset #fff; color:#555; padding: 2px;" disabled>
                        </div>
                        <iframe src="${link}" style="width:100%; height: 500px; border:none; display:block;"></iframe>
                    `;
                }
                // --- CAS CLASSIQUE : FICHIER STANDARD ---
                else {
                    if (!modalWindowContent) return;
                    modalWindowContent.style.padding = "20px";
                    modalWindowContent.style.height = "auto";
                    modalWindowContent.style.maxHeight = "400px";
                    // On restaure la structure normale
                    modalWindowContent.innerHTML = defaultModalHTML;
                    if (modalHeaderTitle) modalHeaderTitle.innerText = "DETAIL_PROJET.EXE";

                    const mIcon = document.getElementById('modal-icon');
                    const mTitle = document.getElementById('modal-title');
                    const mDesc = document.getElementById('modal-desc');
                    const mLink = document.getElementById('modal-link');

                    if (mIcon) mIcon.innerHTML = iconHTML;
                    if (mTitle) mTitle.innerText = title;
                    if (mDesc) mDesc.innerHTML = desc;

                    if (mLink) {
                        if (link && link !== "") {
                            mLink.href = link;
                            mLink.style.display = "inline-block";
                        } else {
                            mLink.style.display = "none";
                        }
                    }
                }

                openModal();
            });
        });
    }

    /* --- FONCTIONS OUVERTURE / FERMETURE --- */
    function openModal() {
        if (modalOverlay) {
            lastFocusedElementBeforeModal = document.activeElement;
            document.body.style.overflow = 'hidden';
            modalOverlay.classList.remove('hidden');
            setTimeout(() => {
                modalOverlay.classList.add('active');
                if (closeBtn) closeBtn.focus();
            }, 10);
            document.addEventListener('keydown', handleKeyDownForModal);
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';

            // Si on jouait de la musique via l'iframe, on veut l'arrêter en fermant la fenêtre
            // On vide le contenu pour tuer l'iframe
            setTimeout(() => {
               if (modalWindowContent) modalWindowContent.innerHTML = ""; 
            }, 200);

            setTimeout(() => {
                modalOverlay.classList.add('hidden');
                // On remet le contenu par défaut pour la prochaine fois
                if (modalWindowContent) modalWindowContent.innerHTML = defaultModalHTML;
                try { if (lastFocusedElementBeforeModal) lastFocusedElementBeforeModal.focus(); } catch (e) {}
            }, 300);
            document.removeEventListener('keydown', handleKeyDownForModal);
        }
    }

    function handleKeyDownForModal(e) {
        if (e.key === 'Escape') closeModal();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    /* ───────── EASTER EGG ───────── */
    const avatar = document.querySelector('.avatar img');
    let clickCount = 0;

    if(avatar) {
        avatar.addEventListener('click', () => {
            clickCount++;
            if(clickCount === 5) {
                alert("🎉 Vous avez trouvé le secret ! 🎉");
                avatar.style.transition = "transform 2s";
                avatar.style.transform = "rotate(3600deg)";
                clickCount = 0;
            }
        });
    }

    /* ───────── HORLOGE ───────── */
    function updateClock() {
        const clockElement = document.getElementById('clock');
        if(clockElement) {
            const now = new Date();
            clockElement.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    /* ───────── SYSTEME DE ZOOM IMAGE (LIGHTBOX) ───────── */
    // On crée dynamiquement l'élément de zoom s'il n'existe pas dans le HTML
    const dialog = document.createElement('dialog');
    dialog.id = 'imageDialog';
    dialog.style.cssText = "border:none; border-radius:10px; padding:0; cursor:zoom-out; background:rgba(0,0,0,0.8);";
    dialog.innerHTML = `<img id="fullImage" src="" style="max-width:90vw; max-height:90vh; display:block; margin:auto; border:3px solid #fff;">`;
    document.body.appendChild(dialog);

    // Fermer au clic sur le fond noir ou l'image
    dialog.addEventListener('click', () => dialog.close());

    // Fonction globale pour ouvrir l'image (utilisée par le onclick dans le HTML)
    window.openImage = function(src) {
        const fullImg = document.getElementById('fullImage');
        fullImg.src = src;
        dialog.showModal();
    };

    /* ───────── GESTION DU BUREAU (DRAG & DROP COMPÉTENCES) ───────── */
    const draggableCards = document.querySelectorAll('.draggable-window');
    console.log('Found draggable cards:', draggableCards.length);

    draggableCards.forEach((card, index) => {
        console.log('Processing card', index, card);
        
        let isBeingDragged = false;
        let offsetX = 0, offsetY = 0;

        const header = card.querySelector('.window-header');
        console.log('Card', index, 'header:', header);
        console.log('Card', index, 'class:', card.className);
        
        if (!header) {
            console.warn('No header found for card', index);
            return;
        }

        console.log('Adding mousedown listener to header', index);
        header.addEventListener('mousedown', function(e) {
            console.log('🎯 MOUSEDOWN FIRED on card', index);
            card.style.background = '#ff0000'; // Visual feedback - turn red
            setTimeout(() => { card.style.background = ''; }, 300);
            
            isBeingDragged = true;
            
            // Calculate offset between mouse and card position
            const rect = card.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            console.log('Offset calculated:', offsetX, offsetY);
            console.log('Card rect:', rect);
            
            // Bring card to front
            draggableCards.forEach(c => c.style.zIndex = 1);
            card.style.zIndex = 1000;
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isBeingDragged) return;
            
            console.log('🔄 MOVING card', index, 'isBeingDragged:', isBeingDragged);
            
            // Get parent desktop area for positioning reference
            const parent = card.parentElement;
            if (!parent) {
                console.error('No parent found for card', index);
                return;
            }
            
            const parentRect = parent.getBoundingClientRect();
            console.log('Parent rect:', parentRect);
            console.log('Mouse position:', e.clientX, e.clientY);
            
            // Calculate new position relative to parent
            let newX = e.clientX - parentRect.left - offsetX;
            let newY = e.clientY - parentRect.top - offsetY;
            
            console.log('New position before bounds:', newX, newY);
            
            // Keep within bounds
            newX = Math.max(0, Math.min(newX, parentRect.width - card.offsetWidth));
            newY = Math.max(0, Math.min(newY, parentRect.height - card.offsetHeight));
            
            console.log('New position after bounds:', newX, newY);
            
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
            console.log('Card position set to:', card.style.left, card.style.top);
        });

        document.addEventListener('mouseup', function() {
            if (isBeingDragged) {
                console.log('🛑 MOUSEUP - stopping drag on card', index);
                isBeingDragged = false;
            }
        });


        // --- GESTION DU DOUBLE CLIC ---
        card.addEventListener('dblclick', () => {
            if (!modalWindowContent) return;
            
            // On restaure le HTML de base
            modalWindowContent.innerHTML = defaultModalHTML;

            const titleElem = card.querySelector('h3');
            const title = titleElem ? titleElem.innerText : 'Compétence';
            const desc = card.getAttribute('data-detail');
            const iconElem = card.querySelector('.icon-box');
            const iconHtml = iconElem ? iconElem.innerHTML : '';

            const mTitle = document.getElementById('modal-title');
            const mDesc = document.getElementById('modal-desc');
            const mIcon = document.getElementById('modal-icon');

            if (modalHeaderTitle) modalHeaderTitle.innerText = "DETAIL_COMPETENCE.EXE";
            if (mTitle) mTitle.innerText = title;
            if (mDesc) mDesc.innerHTML = desc;
            if (mIcon) mIcon.innerHTML = iconHtml;
            
            openModal(); // Appelle ta fonction existante d'ouverture de modale
        });
        
        // Gérer le clic sur la petite croix (X) de la mini fenêtre
        const miniBtn = card.querySelector('.mini-btn');
        if(miniBtn) {
            miniBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                card.style.display = 'none'; // Cache la fenêtre si on clique sur X
            });
        }
    });
});

function launchApp(appName, description, iconClass, colorClass) {
    const overlay = document.getElementById('app-modal-overlay');
    const titleBar = document.getElementById('modal-title-bar');
    const contentBox = document.getElementById('modal-dynamic-content');

    // 1. Mettre à jour le titre de la fenêtre
    titleBar.innerText = `C:\\System32\\${appName}.exe`;

    // 2. Créer le contenu HTML dynamique
    // On reprend le style "terminal" ou "info système"
    contentBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px; border-bottom: 2px dashed #808080; padding-bottom: 15px;">
            <div class="icon-box ${colorClass}" style="width: 60px; height: 60px; font-size: 30px;">
                <i class="${iconClass}"></i>
            </div>
            <div>
                <h2 style="margin: 0; font-family: 'Courier New'; text-transform: uppercase;">${appName}</h2>
                <span style="font-size: 12px; color: #555;">Version 2026.1.0</span>
            </div>
        </div>

        <div style="font-family: 'Courier New'; font-size: 14px; line-height: 1.6;">
            <p><strong>> STATUT :</strong> INSTALLÉ</p>
            <p><strong>> UTILISATION :</strong></p>
            <p style="background: white; border: 2px inset #fff; padding: 10px; margin-top: 5px;">
                ${description}
            </p>
        </div>
    `;

    // 3. Afficher la fenêtre
    overlay.classList.add('active');
}

function closeAppModal(event) {
    // Si event est null, c'est qu'on a cliqué sur le bouton X ou Fermer directement
    if (!event || event.target.id === 'app-modal-overlay' || event.target.classList.contains('close-btn') || event.target.tagName === 'BUTTON') {
        document.getElementById('app-modal-overlay').classList.remove('active');
    }
}
const skillsDatabase = {
    num: [
        { name: "HTML_CSS.txt", icon: "fa-file-code", color: "color-1", desc: "Maîtrise de la structure web, du responsive design et de l'intégration de maquettes rétro." },
        { name: "JS_Logic.exe", icon: "fa-gear", color: "color-2", desc: "Manipulation du DOM, gestion des événements et création d'interfaces interactives." },
        { name: "TICE_Expert.doc", icon: "fa-file-word", color: "color-4", desc: "Expertise sur Classroomscreen et Digiscreen pour la gestion de classe numérique." }
    ],
    ped: [
        { name: "Gestion_Classe.sys", icon: "fa-users", color: "color-3", desc: "Mise en place de rituels pédagogiques et organisation spatio-temporelle des apprentissages." },
        { name: "RGPD_Rules.pdf", icon: "fa-shield-halved", color: "color-1", desc: "Utilisation d'outils libres et protection des données élèves (La Digitale)." }
    ],
    lang: [
        { name: "Anglais.lng", icon: "fa-language", color: "color-2", desc: "Niveau C1 - Capacité à enseigner et créer des supports bilingues." }
    ]
};

function switchFolder(element, category) {
    // 1. Gérer l'apparence des onglets
    document.querySelectorAll('.folder-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    // 2. Mettre à jour la vue des fichiers
    const container = document.getElementById('folder-view');
    const data = skillsDatabase[category];
    
    container.innerHTML = "";
    data.forEach(item => {
        const fileDiv = document.createElement('div');
        fileDiv.className = "file-icon-btn";
        fileDiv.innerHTML = `
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.name}</span>
        `;
        // On réutilise votre fonction launchApp déjà existante dans votre JS !
        fileDiv.onclick = () => launchApp(item.name, item.desc, item.icon, item.color);
        container.appendChild(fileDiv);
    });

    // 3. Update status bar
    document.getElementById('item-count').innerText = `${data.length} objets`;
}