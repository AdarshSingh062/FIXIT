require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Rating = require('../models/Rating');
const ActivityLog = require('../models/ActivityLog');
const logger = require('./logger');
const { COMPLAINT_STATUS, COMPLAINT_PRIORITY, NOTIFICATION_TYPES } = require('../config/constants');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fixit_db';
    logger.info(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    logger.info('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Complaint.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Rating.deleteMany({});
    await ActivityLog.deleteMany({});

    logger.info('Seeding Categories...');
    const categories = await Category.create([
      {
        name: 'Road Damage & Potholes',
        slug: 'road-damage-potholes',
        description: 'Potholes, broken tarmac, cave-ins, and uneven road surfaces',
        icon: 'Construction',
        color: '#f59e0b',
        defaultPriority: COMPLAINT_PRIORITY.HIGH,
        slaHours: 24,
        department: 'Roads & Infrastructure'
      },
      {
        name: 'Garbage & Waste Disposal',
        slug: 'garbage-waste-disposal',
        description: 'Uncollected garbage heaps, overflowing municipal bins, and illegal dumping',
        icon: 'Trash2',
        color: '#10b981',
        defaultPriority: COMPLAINT_PRIORITY.MEDIUM,
        slaHours: 12,
        department: 'Sanitation & Environment'
      },
      {
        name: 'Water Leakage & Supply',
        slug: 'water-leakage-supply',
        description: 'Broken pipelines, low pressure, contaminated water, or burst mains',
        icon: 'Droplets',
        color: '#06b6d4',
        defaultPriority: COMPLAINT_PRIORITY.HIGH,
        slaHours: 18,
        department: 'Water Supply & Sewerage'
      },
      {
        name: 'Street Lighting & Electrical',
        slug: 'street-lighting-electrical',
        description: 'Faulty streetlights, open transformer boxes, and sparking wires',
        icon: 'Zap',
        color: '#eab308',
        defaultPriority: COMPLAINT_PRIORITY.CRITICAL,
        slaHours: 8,
        department: 'Power & Grid Utilities'
      },
      {
        name: 'Drainage & Sewage Blockage',
        slug: 'drainage-sewage-blockage',
        description: 'Blocked stormwater drains, overflowing manholes, and street waterlogging',
        icon: 'Waves',
        color: '#8b5cf6',
        defaultPriority: COMPLAINT_PRIORITY.HIGH,
        slaHours: 20,
        department: 'Sanitation & Environment'
      },
      {
        name: 'Traffic & Road Safety',
        slug: 'traffic-road-safety',
        description: 'Malfunctioning traffic signals, missing safety barriers, or hazardous crossings',
        icon: 'ShieldAlert',
        color: '#ef4444',
        defaultPriority: COMPLAINT_PRIORITY.CRITICAL,
        slaHours: 6,
        department: 'Traffic Police & Safety'
      },
      {
        name: 'Public Property Damage',
        slug: 'public-property-damage',
        description: 'Damaged park benches, broken playground equipment, and defaced public signs',
        icon: 'Building2',
        color: '#ec4899',
        defaultPriority: COMPLAINT_PRIORITY.LOW,
        slaHours: 72,
        department: 'Civic Maintenance'
      },
      {
        name: 'Other Civic Inconvenience',
        slug: 'other-civic-inconvenience',
        description: 'Noise pollution, stray animal hazards, or general civic inconveniences',
        icon: 'HelpCircle',
        color: '#64748b',
        defaultPriority: COMPLAINT_PRIORITY.LOW,
        slaHours: 48,
        department: 'General Administration'
      }
    ]);

    logger.info('Seeding Users (Admin, Workers, Citizens)...');
    // 1. Admin
    const admin = await User.create({
      name: 'Eleanor Vance (City Admin)',
      email: 'admin@fixit.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      bio: 'Chief Municipal Officer & FixIt Central Dispatch Supervisor'
    });

    // 2. Workers
    const workerRoads = await User.create({
      name: 'Marcus Vance',
      email: 'worker.roads@fixit.com',
      password: 'Worker@123',
      role: 'worker',
      phone: '+1 (555) 019-4822',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Senior Asphalt & Civil Engineering Specialist with 8+ years municipal experience',
      workerDetails: {
        department: 'Roads & Infrastructure',
        specialization: 'Potholes & Structural Tarmac Repair',
        skills: ['Heavy Machinery', 'Asphalt Patching', 'Surveying'],
        status: 'available',
        activeTasks: 1,
        completedTasks: 14,
        avgRating: 4.9,
        totalRatings: 12
      }
    });

    const workerElectric = await User.create({
      name: 'Elena Rostova',
      email: 'worker.electric@fixit.com',
      password: 'Worker@123',
      role: 'worker',
      phone: '+1 (555) 019-7711',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      bio: 'Certified High-Voltage Grid & Lighting Field Engineer',
      workerDetails: {
        department: 'Power & Grid Utilities',
        specialization: 'High-Voltage Wiring & LED Lighting Grid',
        skills: ['Electrical Safety', 'Grid Diagnosis', 'Pole Maintenance'],
        status: 'available',
        activeTasks: 1,
        completedTasks: 22,
        avgRating: 4.8,
        totalRatings: 19
      }
    });

    const workerSanitation = await User.create({
      name: 'David Chen',
      email: 'worker.sanitation@fixit.com',
      password: 'Worker@123',
      role: 'worker',
      phone: '+1 (555) 019-9944',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      bio: 'Sanitation Dispatch Lead & Hydro-Jetting Machine Specialist',
      workerDetails: {
        department: 'Sanitation & Environment',
        specialization: 'Drainage Cleansing & Waste Logistics',
        skills: ['Drain Unblocking', 'Waste Hauling', 'Hazmat Handling'],
        status: 'available',
        activeTasks: 1,
        completedTasks: 31,
        avgRating: 4.7,
        totalRatings: 28
      }
    });

    // 3. Citizens
    const citizen1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'citizen@fixit.com',
      password: 'User@123',
      role: 'user',
      phone: '+1 (555) 019-3322',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      bio: 'Active resident of Greenfield Ward 4, passionate about community cleanliness'
    });

    const citizen2 = await User.create({
      name: 'Alex Morris',
      email: 'alex.morris@gmail.com',
      password: 'User@123',
      role: 'user',
      phone: '+1 (555) 019-1155',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      bio: 'Downtown resident and daily cyclist'
    });

    const citizen3 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      password: 'User@123',
      role: 'user',
      phone: '+1 (555) 019-6688',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Oakridge Neighborhood Association Secretary'
    });

    logger.info('Seeding Sample Complaints Across Workflow States...');

    // Complaint 1: Closed & Rated (Road Damage)
    const complaint1 = await Complaint.create({
      title: 'Deep Hazardous Pothole near 5th Avenue Crossing',
      description: 'Massive pothole in the center lane right outside the grocery store. Causing sharp tire damage and sudden braking from drivers.',
      category: categories[0]._id, // Road Damage
      priority: COMPLAINT_PRIORITY.HIGH,
      priorityScore: 75,
      priorityReason: 'Auto-assigned based on: Contains high-risk trigger: "hazardous", Category has high safety risk weighting',
      status: COMPLAINT_STATUS.CLOSED,
      images: [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
      ],
      beforeImages: [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
      ],
      resolutionImages: [
        'https://images.unsplash.com/photo-1584463699039-389eb0625a58?auto=format&fit=crop&w=600&q=80'
      ],
      resolutionNotes: 'Filled and leveled using fast-curing bitumen asphalt mix. Road resurfaced and steam-rollered flat.',
      location: {
        address: '422 5th Avenue, Greenfield District',
        landmark: 'Opposite WholeMart Foods',
        city: 'Metropolis',
        postalCode: '10001',
        type: 'Point',
        coordinates: [-73.985131, 40.748817]
      },
      latitude: 40.748817,
      longitude: -73.985131,
      createdBy: citizen1._id,
      assignedWorker: workerRoads._id,
      publicImpact: true,
      resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      timeline: [
        { status: COMPLAINT_STATUS.PENDING, updatedBy: citizen1._id, note: 'Issue reported by citizen', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.ASSIGNED, updatedBy: admin._id, note: `Assigned to ${workerRoads.name}`, timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.ACCEPTED, updatedBy: workerRoads._id, note: 'Task accepted and scheduled', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.IN_PROGRESS, updatedBy: workerRoads._id, note: 'Crew on site laying asphalt', timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.RESOLVED, updatedBy: workerRoads._id, note: 'Paving finished and curing complete', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.CLOSED, updatedBy: citizen1._id, note: 'Citizen verified resolution and left 5-star rating', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) }
      ]
    });

    // Rating for Complaint 1
    const rating1 = await Rating.create({
      complaintId: complaint1._id,
      citizen: citizen1._id,
      worker: workerRoads._id,
      rating: 5,
      review: 'Incredible speed! The asphalt was laid cleanly within 24 hours. Traffic is smooth again.',
      punctuality: 5,
      quality: 5
    });
    complaint1.rating = rating1._id;
    await complaint1.save();

    // Complaint 2: In Progress (Street Lighting)
    const complaint2 = await Complaint.create({
      title: 'Flickering and Exposed Live Wires on Light Pole #14',
      description: 'Streetlight pole base cover is missing and sparking wires are exposed after heavy storm. Immediate danger to pedestrians and school children.',
      category: categories[3]._id, // Street Lighting & Electrical
      priority: COMPLAINT_PRIORITY.CRITICAL,
      priorityScore: 95,
      priorityReason: 'Auto-assigned based on: Contains critical hazard trigger: "sparking wires", Category has high safety risk weighting',
      isEmergency: true,
      publicImpact: true,
      status: COMPLAINT_STATUS.IN_PROGRESS,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
      ],
      beforeImages: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
      ],
      location: {
        address: 'Corner of Elm St & 8th Lane',
        landmark: 'Next to St. Jude Elementary School',
        city: 'Metropolis',
        postalCode: '10003',
        type: 'Point',
        coordinates: [-73.991201, 40.73061]
      },
      latitude: 40.73061,
      longitude: -73.991201,
      createdBy: citizen2._id,
      assignedWorker: workerElectric._id,
      timeline: [
        { status: COMPLAINT_STATUS.PENDING, updatedBy: citizen2._id, note: 'Emergency issue reported', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.ASSIGNED, updatedBy: admin._id, note: 'Emergency dispatch to Elena Rostova', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.ACCEPTED, updatedBy: workerElectric._id, note: 'Worker dispatched with bucket truck', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.IN_PROGRESS, updatedBy: workerElectric._id, note: 'Power isolated to pole; replacing damaged insulation and circuit breaker', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      ]
    });

    // Complaint 3: Assigned (Drainage Blockage)
    const complaint3 = await Complaint.create({
      title: 'Severe Storm Drain Overflow and Stagnant Water',
      description: 'Storm drain clogged with tree branches and silt. Rainwater is backing up onto sidewalks causing foul odor and pedestrian blockages.',
      category: categories[4]._id, // Drainage & Sewage
      priority: COMPLAINT_PRIORITY.HIGH,
      priorityScore: 70,
      priorityReason: 'Auto-assigned based on: Contains high-risk trigger: "sewage overflow", Category has utility impact weighting',
      status: COMPLAINT_STATUS.ASSIGNED,
      images: [
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=600&q=80'
      ],
      location: {
        address: '78 Pinecrest Boulevard',
        landmark: 'Near Central Community Park East Gate',
        city: 'Metropolis',
        postalCode: '10005',
        type: 'Point',
        coordinates: [-74.006015, 40.712776]
      },
      latitude: 40.712776,
      longitude: -74.006015,
      createdBy: citizen3._id,
      assignedWorker: workerSanitation._id,
      timeline: [
        { status: COMPLAINT_STATUS.PENDING, updatedBy: citizen3._id, note: 'Issue reported by citizen', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.ASSIGNED, updatedBy: admin._id, note: `Assigned to ${workerSanitation.name}`, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) }
      ]
    });

    // Complaint 4: Pending Review (Garbage)
    const complaint4 = await Complaint.create({
      title: 'Uncollected Commercial Waste Dump Behind Market Alley',
      description: 'Waste collection truck missed the pickup for 4 consecutive days. Massive pile attracting strays and generating foul stench.',
      category: categories[1]._id, // Garbage
      priority: COMPLAINT_PRIORITY.MEDIUM,
      priorityScore: 50,
      priorityReason: 'Standard severity evaluation for Sanitation category',
      status: COMPLAINT_STATUS.PENDING,
      images: [
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'
      ],
      location: {
        address: 'Market Square Alleyway #3',
        landmark: 'Behind Farmer Market stalls',
        city: 'Metropolis',
        postalCode: '10002',
        type: 'Point',
        coordinates: [-73.9903, 40.7209]
      },
      latitude: 40.7209,
      longitude: -73.9903,
      createdBy: citizen1._id,
      timeline: [
        { status: COMPLAINT_STATUS.PENDING, updatedBy: citizen1._id, note: 'Reported by Sarah Jenkins', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      ]
    });

    // Complaint 5: Resolved awaiting citizen verification (Water Leakage)
    const complaint5 = await Complaint.create({
      title: 'Water Main Valve Leak on Parkside Walk',
      description: 'Continuous fresh water gushing from municipal curb stop valve.',
      category: categories[2]._id,
      priority: COMPLAINT_PRIORITY.HIGH,
      priorityScore: 68,
      status: COMPLAINT_STATUS.RESOLVED,
      images: [
        'https://images.unsplash.com/photo-1584463699039-389eb0625a58?auto=format&fit=crop&w=600&q=80'
      ],
      beforeImages: [
        'https://images.unsplash.com/photo-1584463699039-389eb0625a58?auto=format&fit=crop&w=600&q=80'
      ],
      resolutionImages: [
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
      ],
      resolutionNotes: 'Replaced ruptured brass gasket seal and tightened curb valve bolt assembly to 45 ft-lbs.',
      location: {
        address: '15 Parkside Promenade',
        landmark: 'Near North Fountain',
        city: 'Metropolis',
        postalCode: '10007',
        type: 'Point',
        coordinates: [-73.9785, 40.7648]
      },
      latitude: 40.7648,
      longitude: -73.9785,
      createdBy: citizen3._id,
      assignedWorker: workerSanitation._id,
      resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      timeline: [
        { status: COMPLAINT_STATUS.PENDING, updatedBy: citizen3._id, note: 'Issue submitted', timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.ASSIGNED, updatedBy: admin._id, note: 'Assigned to David Chen', timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.ACCEPTED, updatedBy: workerSanitation._id, note: 'Accepted', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.IN_PROGRESS, updatedBy: workerSanitation._id, note: 'Replacing seal', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
        { status: COMPLAINT_STATUS.RESOLVED, updatedBy: workerSanitation._id, note: 'Seal replaced and verified under pressure', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) }
      ]
    });

    // Seed Comments
    logger.info('Seeding Comments & Discussions...');
    await Comment.create([
      {
        complaintId: complaint2._id,
        user: workerElectric._id,
        message: 'I have arrived on site and established safety cones. Proceeding to isolate the feed circuit.',
        isInternal: false
      },
      {
        complaintId: complaint2._id,
        user: citizen2._id,
        message: 'Thank you for the quick response! The school bell rings in 1 hour so getting it secured is huge.',
        isInternal: false
      },
      {
        complaintId: complaint2._id,
        user: admin._id,
        message: 'Internal Note: Utility substation notified. Feeder circuit #4 log updated.',
        isInternal: true
      },
      {
        complaintId: complaint1._id,
        user: citizen1._id,
        message: 'Road looks immaculate! Much appreciated team.',
        isInternal: false
      }
    ]);

    // Seed Notifications
    logger.info('Seeding Notifications...');
    await Notification.create([
      {
        recipient: citizen2._id,
        sender: workerElectric._id,
        type: NOTIFICATION_TYPES.STATUS_CHANGED,
        title: 'Work In Progress on Light Pole #14',
        message: 'Elena Rostova started work on your reported electrical issue.',
        complaintId: complaint2._id,
        link: `/complaints/${complaint2._id}`,
        isRead: false
      },
      {
        recipient: workerSanitation._id,
        sender: admin._id,
        type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
        title: 'New Task: Storm Drain Overflow',
        message: 'You have been assigned to investigate drain overflow on 78 Pinecrest Blvd.',
        complaintId: complaint3._id,
        link: `/worker/tasks/${complaint3._id}`,
        isRead: false
      },
      {
        recipient: citizen3._id,
        sender: workerSanitation._id,
        type: NOTIFICATION_TYPES.RESOLUTION_SUBMITTED,
        title: 'Water Main Leak Resolved',
        message: 'David Chen has marked your issue resolved. Please verify and rate.',
        complaintId: complaint5._id,
        link: `/complaints/${complaint5._id}`,
        isRead: false
      }
    ]);

    // Seed Activity Logs
    logger.info('Seeding Activity Logs...');
    await ActivityLog.create([
      {
        user: admin._id,
        action: 'SYSTEM_INITIALIZED',
        entityType: 'System',
        details: { version: '1.0.0', seed: true }
      },
      {
        user: citizen1._id,
        action: 'COMPLAINT_CREATED',
        entityType: 'Complaint',
        entityId: complaint1._id,
        details: { title: complaint1.title, priority: complaint1.priority }
      },
      {
        user: admin._id,
        action: 'COMPLAINT_ASSIGNED',
        entityType: 'Complaint',
        entityId: complaint1._id,
        details: { worker: workerRoads.name }
      },
      {
        user: workerRoads._id,
        action: 'TASK_RESOLVED',
        entityType: 'Complaint',
        entityId: complaint1._id,
        details: { status: 'Resolved' }
      },
      {
        user: citizen1._id,
        action: 'RATING_SUBMITTED',
        entityType: 'Rating',
        entityId: rating1._id,
        details: { rating: 5, worker: workerRoads.name }
      }
    ]);

    logger.info('==========================================');
    logger.info('DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');
    logger.info('==========================================');
    logger.info('Demo Credentials:');
    logger.info('  ADMIN:    admin@fixit.com           / Admin@123');
    logger.info('  WORKER 1: worker.roads@fixit.com    / Worker@123  (Roads)');
    logger.info('  WORKER 2: worker.electric@fixit.com / Worker@123  (Electric)');
    logger.info('  WORKER 3: worker.sanitation@fixit.com / Worker@123 (Sanitation)');
    logger.info('  CITIZEN:  citizen@fixit.com          / User@123');
    logger.info('==========================================');

    if (require.main === module && process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  } catch (error) {
    logger.error('Database seeding failed:', error);
    if (require.main === module && process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
