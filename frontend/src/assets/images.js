import livingRoomImg from './modern_living_room_1786169766310.png';
import kitchenImg from './luxury_kitchen_1786169786299.png';
import bedroomImg from './master_bedroom_1786169805566.png';
import siteProgressImg from './construction_site_progress_1786169829023.png';
import officeImg from './minimalist_office_1786169869898.png';
import bathroomImg from './luxury_bathroom_1786169892311.png';

export const designImages = {
  livingRoom: livingRoomImg,
  kitchen: kitchenImg,
  bedroom: bedroomImg,
  siteProgress: siteProgressImg,
  office: officeImg,
  bathroom: bathroomImg
};

export const sampleGallery = [
  { id: 1, title: 'Modern Living Room Concept', category: 'Living Room', image: livingRoomImg, author: 'Emma Watson', status: 'Approved', views: 342, likes: 45 },
  { id: 2, title: 'Luxury Oak Modular Kitchen', category: 'Kitchen', image: kitchenImg, author: 'Liam Vance', status: 'In Review', views: 512, likes: 89 },
  { id: 3, title: 'Penthouse Master Bedroom', category: 'Bedroom', image: bedroomImg, author: 'Sophia Taylor', status: 'Approved', views: 289, likes: 37 },
  { id: 4, title: 'Executive Home Office', category: 'Office', image: officeImg, author: 'David Chen', status: 'Draft', views: 190, likes: 22 },
  { id: 5, title: 'Spa Bath Suite', category: 'Bathroom', image: bathroomImg, author: 'Emma Watson', status: 'Approved', views: 405, likes: 64 },
  { id: 6, title: 'Site Inspection framing', category: 'Site Progress', image: siteProgressImg, author: 'Engineer John', status: 'On Track', views: 620, likes: 112 }
];
