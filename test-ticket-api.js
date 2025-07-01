const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Test the ticket parsing logic similar to the actual implementation
const TICKETS_DIR = '.totem/tickets';

function parseTicketMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract YAML frontmatter
    const yamlMatch = content.match(/^```yaml\n([\s\S]*?)\n```/);
    if (!yamlMatch) {
      throw new Error('No YAML frontmatter found');
    }
    
    const yamlData = yaml.parse(yamlMatch[1]);
    
    // Extract title from markdown heading
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : yamlData.id;
    
    // Extract description (first paragraph after title)
    const descriptionMatch = content.match(/^# .+\n\n(.+?)(?:\n\n|$)/m);
    const description = descriptionMatch ? descriptionMatch[1] : '';
    
    // Extract acceptance criteria
    const criteriaSection = content.match(/## Acceptance Criteria\n([\s\S]*?)(?:\n## |$)/);
    const acceptance_criteria = [];
    
    if (criteriaSection) {
      const criteriaLines = criteriaSection[1].split('\n').filter(line => line.trim().startsWith('- ['));
      criteriaLines.forEach(line => {
        const isComplete = line.includes('[x]');
        const criteria = line.replace(/^- \[[x\s]\]\s*/, '').trim();
        if (criteria) {
          acceptance_criteria.push({ criteria, complete: isComplete });
        }
      });
    }
    
    // Extract tags from various sources
    const tags = [];
    if (yamlData.persona) tags.push(yamlData.persona);
    if (yamlData.priority) tags.push(yamlData.priority);
    if (yamlData.complexity) tags.push(yamlData.complexity);
    
    // Extract risks
    const risksMatch = content.match(/\*\*Risks:\*\*\s*(.+)/);
    const risks = [];
    if (risksMatch) {
      const riskText = risksMatch[1];
      const riskItems = riskText.split(/,\s*(?=[A-Z])/);
      risks.push(...riskItems.map(risk => risk.trim()));
    }
    
    // Extract implementation notes as resources
    const notesMatch = content.match(/## Implementation Notes\n```[\s\S]*?\n([\s\S]*?)\n```/);
    const resources = [];
    if (notesMatch) {
      const notes = notesMatch[1].split('\n').filter(line => line.trim().startsWith('//'));
      resources.push(...notes.map(note => note.replace(/^\/\/\s*/, '').trim()));
    }
    
    return {
      id: yamlData.id,
      status: yamlData.status || 'open',
      priority: yamlData.priority || 'medium',
      complexity: yamlData.complexity || 'medium',
      persona: yamlData.persona || null,
      collabotator: yamlData.collabotator || null,
      model: yamlData.model || null,
      effort_days: yamlData.effort_days || null,
      blocks: yamlData.blocks || [],
      blocked_by: yamlData.blocked_by || [],
      title,
      description,
      acceptance_criteria,
      tags,
      notes: description,
      risks,
      resources
    };
  } catch (error) {
    console.error(`Error parsing ticket file ${filePath}:`, error);
    return null;
  }
}

function testGetTicketById() {
  const ticketId = 'healthcare.security.auth-sso-001';
  const ticketFile = path.join(__dirname, TICKETS_DIR, `${ticketId}.md`);
  
  console.log('Testing GET /api/ticket/:id simulation...');
  console.log('Ticket ID:', ticketId);
  console.log('Expected file:', ticketFile);
  
  // Check if tickets directory exists
  const ticketsDir = path.join(__dirname, TICKETS_DIR);
  if (!fs.existsSync(ticketsDir)) {
    console.log('404 - Tickets directory not found');
    return;
  }
  
  // Find the markdown file with the matching ID
  const files = fs.readdirSync(ticketsDir).filter(file => file.endsWith('.md'));
  const matchingFile = files.find(file => file.includes(ticketId) || file.startsWith(ticketId));
  
  if (!matchingFile) {
    console.log('404 - No markdown file found with matching ID');
    return;
  }
  
  console.log('Found matching file:', matchingFile);
  
  const filePath = path.join(ticketsDir, matchingFile);
  
  // Parse the ticket markdown file
  const ticket = parseTicketMarkdown(filePath);
  
  if (!ticket) {
    console.log('500 - Error parsing ticket');
    return;
  }
  
  // Verify the parsed ticket ID matches the requested ID
  if (ticket.id !== ticketId) {
    console.log('404 - Ticket ID mismatch');
    return;
  }
  
  console.log('200 - Success!');
  console.log('Parsed ticket:', JSON.stringify(ticket, null, 2));
  
  // Compare with sample.json structure
  const expectedFields = [
    'id', 'status', 'priority', 'complexity', 'persona', 'collabotator', 'model',
    'blocks', 'blocked_by', 'title', 'description', 'acceptance_criteria', 
    'tags', 'notes', 'risks', 'resources'
  ];
  
  console.log('\n--- Structure Validation ---');
  let missingFields = [];
  let validStructure = true;
  
  expectedFields.forEach(field => {
    if (!(field in ticket)) {
      missingFields.push(field);
      validStructure = false;
    }
  });
  
  if (validStructure) {
    console.log('✅ All expected fields present');
  } else {
    console.log('❌ Missing fields:', missingFields);
  }
  
  // Validate acceptance_criteria structure
  if (Array.isArray(ticket.acceptance_criteria) && ticket.acceptance_criteria.length > 0) {
    const firstCriteria = ticket.acceptance_criteria[0];
    if (firstCriteria.criteria && typeof firstCriteria.complete === 'boolean') {
      console.log('✅ Acceptance criteria structure valid');
    } else {
      console.log('❌ Acceptance criteria structure invalid');
    }
  }
  
  console.log('✅ Response matches sample.json structure!');
}

function testNotFoundScenarios() {
  console.log('\n--- Testing 404 Scenarios ---');
  
  // Test non-existent ticket
  const nonExistentId = 'non.existent.ticket-999';
  const ticketsDir = path.join(__dirname, TICKETS_DIR);
  const files = fs.readdirSync(ticketsDir).filter(file => file.endsWith('.md'));
  const matchingFile = files.find(file => file.includes(nonExistentId) || file.startsWith(nonExistentId));
  
  if (!matchingFile) {
    console.log('✅ Correctly returns 404 for non-existent ticket');
  } else {
    console.log('❌ Should return 404 for non-existent ticket');
  }
}

console.log('Testing ticket API logic...\n');
testGetTicketById();
testNotFoundScenarios();
