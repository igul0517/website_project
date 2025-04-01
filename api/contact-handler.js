// API endpoint for handling contact form submissions and retrieving contact information
export const config = {
    runtime: 'edge',
    api: {
        bodyParser: {
            sizeLimit: '1mb'
        }
    }
};

// Validation helpers
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePhone = (phone) => {
    const re = /^\+?[0-9\s-()]{8,}$/;
    return re.test(phone);
};

const validateUnit = (unit) => {
    return /^[0-9]{1,4}[A-Za-z]?$/.test(unit);
};

// Mock database
const mockDatabase = {
    contacts: {
        '101': { owner: 'John Smith', email: 'john@example.com', phone: '0400 111 222' },
        '102': { owner: 'Jane Doe', email: 'jane@example.com', phone: '0400 333 444' },
        '103': { owner: 'Bob Wilson', email: 'bob@example.com', phone: '0400 555 666' }
    },
    messages: []
};

export default async function handler(request) {
    // Set CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        if (request.method === 'GET') {
            const { searchParams } = new URL(request.url);
            const unit = searchParams.get('unit');

            // Validate unit format
            if (!unit || !validateUnit(unit)) {
                return new Response(JSON.stringify({
                    error: 'Invalid unit number format'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // Get contact info from mock database
            const contactInfo = mockDatabase.contacts[unit];
            if (!contactInfo) {
                return new Response(JSON.stringify({
                    error: 'Unit not found'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            return new Response(JSON.stringify({
                unit,
                ...contactInfo,
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'private, no-cache',
                    ...corsHeaders
                }
            });
        }

        if (request.method === 'POST') {
            const data = await request.json();
            const { name, unit, email, subject, message, phone } = data;

            // Validate required fields
            const errors = [];
            if (!name?.trim()) errors.push('Name is required');
            if (!unit?.trim()) errors.push('Unit number is required');
            if (!email?.trim()) errors.push('Email is required');
            if (!subject?.trim()) errors.push('Subject is required');
            if (!message?.trim()) errors.push('Message is required');

            // Validate field formats
            if (email && !validateEmail(email)) errors.push('Invalid email format');
            if (phone && !validatePhone(phone)) errors.push('Invalid phone format');
            if (unit && !validateUnit(unit)) errors.push('Invalid unit number format');
            if (message?.length > 1000) errors.push('Message is too long (max 1000 characters)');
            if (subject?.length > 100) errors.push('Subject is too long (max 100 characters)');

            if (errors.length > 0) {
                return new Response(JSON.stringify({
                    error: 'Validation failed',
                    errors
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // In a real app, save to database and send notifications
            // For demo, we'll add to mock database
            const timestamp = new Date().toISOString();
            const messageId = `msg_${Date.now()}`;
            
            mockDatabase.messages.push({
                id: messageId,
                name,
                unit,
                email,
                subject,
                message,
                phone,
                timestamp,
                status: 'unread'
            });

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return new Response(JSON.stringify({
                success: true,
                messageId,
                timestamp,
                message: 'Contact form submitted successfully',
                nextSteps: [
                    'Your message has been received',
                    'A confirmation email will be sent shortly',
                    'We aim to respond within 24 hours'
                ]
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        return new Response(JSON.stringify({
            error: 'Method not allowed'
        }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        console.error('Contact handler error:', error);

        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}
