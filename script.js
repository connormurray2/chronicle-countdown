'use strict';

// ── Configuration ────────────────────────────────────────────────────────────
// Set this to the activation transaction txid once the transaction is generated.
// Leave empty ('') to hide the activation transaction status box.
const ACTIVATION_TXID = 'b91722faffbea406986690fa430f916f625eb81eb4e57bfd55dbd54dca5e8d22';

const TARGET_BLOCK = 943816;
const FALLBACK_BLOCK_TIME = 600; // seconds
const REFRESH_INTERVAL = 60000;  // 60 seconds

// Approximate current block at time of build — used for the initial static
// estimate before the first API call returns.
const APPROX_CURRENT_BLOCK = 943065;

// ── Block Time Estimator ─────────────────────────────────────────────────────

async function fetchChainInfo() {
    const resp = await fetch('https://api.whatsonchain.com/v1/bsv/main/chain/info');
    if (!resp.ok) throw new Error(`Chain info: HTTP ${resp.status}`);
    const data = await resp.json();
    if (typeof data.blocks !== 'number') throw new Error('Unexpected chain info format');
    return data.blocks;
}

async function fetchRecentHeaders() {
    const resp = await fetch('https://api.whatsonchain.com/v1/bsv/main/block/headers/25');
    if (!resp.ok) throw new Error(`Headers: HTTP ${resp.status}`);
    const headers = await resp.json();
    return headers.map(h => h.time); // Unix timestamps (seconds)
}

function computeAvgBlockTime(timestamps) {
    if (!timestamps || timestamps.length < 2) return FALLBACK_BLOCK_TIME;
    const sorted = [...timestamps].sort((a, b) => a - b);
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
        total += sorted[i] - sorted[i - 1];
    }
    const avg = Math.round(total / (sorted.length - 1));
    // Sanity clamp: ignore wildly unrealistic values
    return avg > 0 && avg < 7200 ? avg : FALLBACK_BLOCK_TIME;
}

function estimateActivation(currentHeight, avgBlockTime) {
    const blocksRemaining = Math.max(0, TARGET_BLOCK - currentHeight);
    const isActive = currentHeight >= TARGET_BLOCK;
    const estimatedTimestamp = Date.now() + blocksRemaining * avgBlockTime * 1000;
    return { blocksRemaining, estimatedTimestamp, isActive };
}

function startDataRefresh(callback, intervalMs = REFRESH_INTERVAL) {
    async function refresh() {
        let currentHeight = null;
        let avgBlockTime = FALLBACK_BLOCK_TIME;
        let apiLive = false;

        try {
            currentHeight = await fetchChainInfo();
            apiLive = true;
        } catch {
            // chain info unavailable — keep currentHeight null
        }

        if (apiLive) {
            try {
                const timestamps = await fetchRecentHeaders();
                avgBlockTime = computeAvgBlockTime(timestamps);
            } catch {
                // headers unavailable — fall back to 600s/block
            }
        }

        callback({ currentHeight, avgBlockTime, apiLive });
    }

    refresh();
    return setInterval(refresh, intervalMs);
}

// ── Countdown Display ────────────────────────────────────────────────────────

// Shared state: the countdown timer reads this every second
let targetTimestamp = null;
let countdownInterval = null;

function startCountdownTimer(getTargetTimestamp) {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const ts = getTargetTimestamp();
        if (ts === null) return;
        const remaining = Math.max(0, ts - Date.now());
        const totalSecs = Math.floor(remaining / 1000);
        const days    = Math.floor(totalSecs / 86400);
        const hours   = Math.floor((totalSecs % 86400) / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        renderCountdown({ days, hours, minutes, seconds });
    }, 1000);
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function renderCountdown({ days, hours, minutes, seconds }) {
    document.getElementById('days').textContent    = days;
    document.getElementById('hours').textContent   = pad2(hours);
    document.getElementById('minutes').textContent = pad2(minutes);
    document.getElementById('seconds').textContent = pad2(seconds);
}

function renderBlockInfo({ currentHeight, blocksRemaining, estimatedDateStr }) {
    if (currentHeight !== null) {
        document.getElementById('current-height').textContent = currentHeight.toLocaleString();
    }
    document.getElementById('blocks-remaining').textContent = blocksRemaining.toLocaleString();
    document.getElementById('estimated-datetime').textContent = estimatedDateStr;
}

function renderActivated() {
    document.getElementById('countdown-section').style.display = 'none';
    document.getElementById('activated-section').style.display = '';
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function renderApiNotice(isLive, lastUpdated) {
    const notice = document.getElementById('api-notice');
    const lastUpdatedEl = document.getElementById('last-updated-text');

    if (!isLive) {
        notice.style.display = '';
        lastUpdatedEl.textContent = lastUpdated
            ? 'Live data unavailable — last updated: ' + lastUpdated.toLocaleTimeString()
            : 'Live data unavailable — using static estimate';
    } else {
        notice.style.display = 'none';
        lastUpdatedEl.textContent = lastUpdated
            ? 'Live data last updated: ' + lastUpdated.toLocaleTimeString()
            : '';
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDatetime(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleString('en-US', {
        month:    'long',
        day:      'numeric',
        year:     'numeric',
        hour:     'numeric',
        minute:   '2-digit',
        timeZoneName: 'short',
    }) + ' (estimate)';
}

// ── Initialisation ───────────────────────────────────────────────────────────

// 6.4 — Static estimate before first API call returns
(function initStaticEstimate() {
    const blocksRemaining = Math.max(0, TARGET_BLOCK - APPROX_CURRENT_BLOCK);
    targetTimestamp = Date.now() + blocksRemaining * FALLBACK_BLOCK_TIME * 1000;
    renderBlockInfo({
        currentHeight:    APPROX_CURRENT_BLOCK,
        blocksRemaining,
        estimatedDateStr: formatDatetime(targetTimestamp),
    });
})();

// Start the second-by-second countdown tick
startCountdownTimer(() => targetTimestamp);

// 6.1 / 6.2 / 6.3 — Wire data refresh to update target timestamp and check activation
let lastSuccessfulUpdate = null;

startDataRefresh(({ currentHeight, avgBlockTime, apiLive }) => {
    if (currentHeight === null) {
        // 6.3 — API unavailable: keep last estimate, show notice
        renderApiNotice(false, lastSuccessfulUpdate);
        return;
    }

    const activation = estimateActivation(currentHeight, avgBlockTime);

    // 6.2 — Check if Chronicle has already activated
    if (activation.isActive) {
        renderActivated();
        renderBlockInfo({
            currentHeight,
            blocksRemaining: 0,
            estimatedDateStr: 'Activated!',
        });
        return;
    }

    // 6.1 — Update target timestamp so countdown reflects fresh data
    targetTimestamp = activation.estimatedTimestamp;

    renderBlockInfo({
        currentHeight,
        blocksRemaining:  activation.blocksRemaining,
        estimatedDateStr: formatDatetime(activation.estimatedTimestamp),
    });

    lastSuccessfulUpdate = new Date();
    renderApiNotice(apiLive, lastSuccessfulUpdate);
});

// ── Activation Transaction Status ────────────────────────────────────────────

const TX_POLL_INTERVAL = 30000; // 30 seconds

async function fetchTxStatus(txid) {
    const resp = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}`);
    if (resp.status === 404) return 'not_broadcast';
    if (!resp.ok) throw new Error(`Unexpected status: ${resp.status}`);
    const data = await resp.json();
    const blockheight = data.blockheight;
    if (blockheight && blockheight > 0) {
        return { confirmed: true, blockheight, confirmations: data.confirmations ?? 1 };
    }
    return 'mempool';
}

function renderTxStatus(status) {
    const el = document.getElementById('tx-status');
    const card = document.querySelector('.tx-status-card');
    if (!el || !card) return;

    card.classList.remove('tx-not-broadcast', 'tx-mempool', 'tx-confirmed');

    if (status === 'not_broadcast') {
        el.textContent = 'Not yet broadcast';
        card.classList.add('tx-not-broadcast');
    } else if (status === 'mempool') {
        el.textContent = 'In mempool — awaiting confirmation';
        card.classList.add('tx-mempool');
    } else if (status?.confirmed) {
        const conf = status.confirmations;
        el.textContent = `Confirmed in block ${status.blockheight.toLocaleString()} — ${conf.toLocaleString()} confirmation${conf === 1 ? '' : 's'}`;
        card.classList.add('tx-confirmed');
    }
}

function startTxPolling(txid) {
    async function poll() {
        const errorEl = document.getElementById('tx-check-error');
        try {
            const status = await fetchTxStatus(txid);
            renderTxStatus(status);
            if (errorEl) errorEl.style.display = 'none';
        } catch {
            if (errorEl) errorEl.style.display = '';
        }
    }

    poll();
    setInterval(poll, TX_POLL_INTERVAL);
}

// 4.5 — Initialise tx status on page load
if (ACTIVATION_TXID) {
    document.getElementById('activation-tx-section').style.display = '';
    startTxPolling(ACTIVATION_TXID);
}
