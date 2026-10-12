const express = require('express');
const router = express.Router();
const { clients, auditLogs, uuidv4 } = require('../data/db');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const { status, search } = req.query;
  let result = [...clients];
  if (status) result = result.filter(c => c.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.company_name.toLowerCase().includes(q) ||
      c.contact_person.toLowerCase().includes(q) ||
      c.client_code.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, data: result, total: result.length });
});

router.get('/:id', authenticate, (req, res) => {
  const client = clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  res.json({ success: true, data: client });
});

router.post('/', authenticate, (req, res) => {
  const { company_name, contact_person, email, phone, whatsapp, address, industry, contract_type, notes } = req.body;
  if (!company_name) return res.status(400).json({ success: false, message: 'company_name is required' });
  const newClient = {
    id: uuidv4(),
    client_code: `C-${String(clients.length + 1).padStart(3, '0')}`,
    company_name, contact_person: contact_person || '',
    email: email || '', phone: phone || '', whatsapp: whatsapp || '',
    address: address || '', industry: industry || '',
    contract_type: contract_type || 'short_term',
    status: 'active', notes: notes || '',
    created_at: new Date().toISOString(),
  };
  clients.push(newClient);
  auditLogs.push({
    id: uuidv4(), user_id: req.user.id, action: 'create',
    entity_type: 'client', entity_id: newClient.id,
    description: `Created client ${newClient.company_name}`,
    ip_address: req.ip, created_at: new Date().toISOString(),
  });
  res.status(201).json({ success: true, data: newClient });
});

router.patch('/:id', authenticate, (req, res) => {
  const idx = clients.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Client not found' });
  const allowed = ['company_name','contact_person','email','phone','whatsapp','address','industry','contract_type','status','notes'];
  allowed.forEach(k => { if (req.body[k] !== undefined) clients[idx][k] = req.body[k]; });
  clients[idx].updated_at = new Date().toISOString();
  res.json({ success: true, data: clients[idx] });
});

router.delete('/:id', authenticate, (req, res) => {
  const idx = clients.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Client not found' });
  const [removed] = clients.splice(idx, 1);
  res.json({ success: true, message: 'Client deleted' });
});

module.exports = router;
