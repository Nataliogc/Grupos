(function (root) {
    'use strict';
    function address(value) {
        const text = String(value || '').trim();
        if (/[\r\n]/.test(text)) throw new Error('La dirección de respuesta no es válida.');
        const match = text.match(/<([^<>]+)>$/);
        const result = match ? match[1] : text;
        if (!/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(result)) {
            throw new Error('No se ha podido identificar el correo de la agencia.');
        }
        return result;
    }
    function buildPayload(item, message) {
        if (!item || !message) throw new Error('Espera a que se cargue el mensaje.');
        if (message.truncated) throw new Error('Este mensaje está abreviado. Contéstalo desde Outlook para conservar el original completo.');
        const subject = String(message.subject || item.subject || '(Sin asunto)').replace(/[\r\n]+/g, ' ').slice(0, 1000);
        const body = String(message.body || '');
        if (body.length > 200000) throw new Error('El mensaje supera el tamaño admitido. Ábrelo en Outlook.');
        return {
            version: 1,
            to: address(message.replyTo || message.from || item.from),
            subject: /^(re|rv|aw):\s*/i.test(subject) ? subject : 'RE: ' + subject,
            originalFrom: String(message.from || item.from || '').replace(/[\r\n]+/g, ' ').slice(0, 1000),
            originalTo: item.mailbox,
            originalSubject: subject,
            receivedAt: message.receivedAt || '',
            body,
            internetMessageId: /^<[^<>\s]{1,990}>$/.test(message.internetMessageId || '') ? message.internetMessageId : ''
        };
    }
    function encodePayload(payload) {
        const bytes = new TextEncoder().encode(JSON.stringify(payload));
        let binary = '';
        for (const b of bytes) binary += String.fromCharCode(b);
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function launch(item, message) {
        const payload = buildPayload(item, message);
        const uri = 'nexus-outlook://reply/' + encodePayload(payload);
        if (uri.length <= 6000) {
            root.location.href = uri;
            return 'Se ha solicitado abrir Outlook clásico. Si no aparece, instala el enlace de Outlook en este equipo.';
        }
        download(payload);
        return 'El mensaje es largo: abre el archivo respuesta.nexusreply descargado para preparar el borrador en Outlook.';
    }
    function download(payload) {
        const url = URL.createObjectURL(new Blob([JSON.stringify(payload)], { type: 'application/octet-stream' }));
        const link = document.createElement('a');
        link.href = url; link.download = 'respuesta.nexusreply';
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    const api = { address, buildPayload, encodePayload, launch, download };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.NexusOutlookReply = api;
})(typeof window !== 'undefined' ? window : globalThis);
