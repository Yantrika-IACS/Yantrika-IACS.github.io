(function () {
  'use strict';

  const groups = [
    {
      value: '100 · सौ',
      tiles: ['एक सौ', 'Paise in ₹1', '1% of 10,000', '4 × 25'],
      why: 'One rupee is 100 paise. Dividing 10,000 by 100 or multiplying 25 by 4 gives the same number.'
    },
    {
      value: '1,000 · हज़ार',
      tiles: ['8 × 125', 'Grams in 1 kg', '1% of a lakh', 'दस सैकड़े'],
      why: 'Ten hundreds make a thousand. A lakh divided by 100 is 1,000, also the number of grams in a kilogram.'
    },
    {
      value: '1,00,000 · लाख',
      tiles: ['1,00,000', 'Hundreds in 1 crore', '10% of 10 lakh', 'हज़ार × सौ'],
      why: 'Dividing a crore by 100 gives a lakh. So does taking a tenth of ten lakh, or multiplying a thousand by a hundred.'
    },
    {
      value: '1,00,00,000 · करोड़',
      tiles: ['100 lakh', '1% of 1 arab', '4 × 25 lakh', 'दस मिलियन'],
      why: 'A crore is ten million, or 100 lakh. One arab is 100 crore, so one per cent of an arab is a crore.'
    }
  ];

  function play(el) {
    const deck = groups.flatMap((group, index) => group.tiles.map(text => ({ text, group: index })));
    for (let end = deck.length - 1; end > 0; end--) {
      const swap = Math.floor(Math.random() * (end + 1));
      [deck[end], deck[swap]] = [deck[swap], deck[end]];
    }
    el.innerHTML = `
      <h2 class="m">Lakh Links · लाख की कड़ियाँ</h2>
      <p>Pick four tiles with the same numerical value. <span lang="hi">एक ही मान वाली चार पर्चियाँ चुनें।</span></p>
      <p class="lakh-links-progress"></p>
      <div class="lakh-links-board" role="group" aria-label="Number tiles"></div>
      <p><button type="button" class="btn cy lakh-links-check" disabled>Check four · जाँचें</button></p>
      <p class="lakh-links-feedback" role="status" aria-live="polite"></p>
      <details><summary>Hint · संकेत</summary><p>1 lakh = 1,00,000. One crore = 100 lakh. For “hundreds in a crore”, divide the value by 100.</p></details>
      <div class="lakh-links-solutions"></div>`;
    const board = el.querySelector('.lakh-links-board');
    const check = el.querySelector('.lakh-links-check');
    const feedback = el.querySelector('.lakh-links-feedback');
    const progress = el.querySelector('.lakh-links-progress');
    const solutions = el.querySelector('.lakh-links-solutions');
    const selected = new Set();
    let solved = 0;

    function update() {
      for (const tile of board.children) {
        tile.setAttribute('aria-pressed', String(selected.has(tile)));
        tile.disabled = selected.size === 4 && !selected.has(tile);
      }
      check.disabled = selected.size !== 4;
      progress.textContent = solved + '/4 groups found · ' + selected.size + '/4 tiles selected';
    }
    deck.forEach(card => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'chip lakh-links-tile';
      tile.textContent = card.text;
      tile.dataset.group = String(card.group);
      tile.onclick = () => {
        if (selected.has(tile)) selected.delete(tile);
        else selected.add(tile);
        feedback.textContent = '';
        update();
      };
      board.appendChild(tile);
    });
    check.onclick = () => {
      const picks = [...selected];
      const values = new Set(picks.map(tile => tile.dataset.group));
      if (values.size !== 1) {
        feedback.textContent = 'These tiles give different values. Try swapping one. · सभी मान बराबर नहीं हैं।';
        picks[0].focus();
        return;
      }
      const group = groups[Number(picks[0].dataset.group)];
      const explanation = document.createElement('p');
      explanation.textContent = group.value + ' — ' + group.why;
      solutions.prepend(explanation);
      picks.forEach(tile => tile.remove());
      selected.clear();
      solved++;
      update();
      feedback.textContent = solved === groups.length
        ? 'All four groups found! · आपने चारों समूह खोज लिए!'
        : 'Matched ' + group.value + '. Find another four.';
      if (board.firstElementChild) board.firstElementChild.focus();
      else {
        const replay = document.createElement('button');
        replay.type = 'button';
        replay.className = 'btn';
        replay.textContent = 'Shuffle and replay · फिर खेलें';
        replay.onclick = () => { play(el); el.querySelector('.lakh-links-tile').focus(); };
        check.replaceWith(replay);
        replay.focus();
      }
    };
    update();
  }

  YK.register({
    id: 'lakh-links', title: 'Lakh Links', pillar: 'learn', icon: '🧩',
    description: 'Match everyday quantities, Hindi numerals and percentages on an Indian place-value wall.',
    authors: ['ModuMath'], thumb: 'games/lakh-links/thumb.svg',
    theory: '<p>Indian digit grouping starts with three digits on the right and continues in pairs. One lakh is 1,00,000; one crore is 1,00,00,000. Write clues in ordinary digits and compare their values.</p>',
    css: `.lakh-links-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.45rem}
      .lakh-links-board .lakh-links-tile{min-height:54px;padding:.45rem;white-space:normal;overflow-wrap:anywhere}
      .lakh-links-tile[aria-pressed=true]{outline:3px double currentColor;outline-offset:-4px;font-weight:bold}
      .lakh-links-tile[aria-pressed=true]::before{content:"✓ "}
      .lakh-links-progress{font-variant-numeric:tabular-nums}
      .lakh-links-feedback{min-height:1.5em}
      @media(max-width:520px){.lakh-links-board{grid-template-columns:repeat(2,minmax(0,1fr))}}`,
    run: play
  });
})();
