import { Calendar, Camera, Heart, Music, Sparkles } from 'lucide-react';

const WeddingTimeline = ({ images, selectedEvent, onEventSelect }) => {
  const events = [
    {
      id: 'all',
      name: 'All Events',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      description: 'Complete Journey'
    },
    {
      id: 'mehndi',
      name: 'Mehndi',
      icon: Sparkles,
      color: 'from-green-400 to-emerald-500',
      description: 'Henna & Traditions',
      emoji: '🌿'
    },
    {
      id: 'haldi',
      name: 'Haldi',
      icon: Sparkles,
      color: 'from-yellow-400 to-orange-500',
      description: 'Turmeric Ceremony',
      emoji: '🌼'
    },
    {
      id: 'dj-night',
      name: 'DJ Night',
      icon: Music,
      color: 'from-purple-500 to-pink-500',
      description: 'Dance & Celebration',
      emoji: '🎵'
    },
    {
      id: 'wedding',
      name: 'Wedding',
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      description: 'Sacred Union',
      emoji: '💒'
    }
  ];

  const getEventPhotoCount = (eventId) => {
    if (eventId === 'all') return images.length;
    return images.filter(img => img.event === eventId).length;
  };
  
  // Filter non-all events for two rows
  const weddingEvents = events.filter(event => event.id !== 'all');
  
  // Create pairs of events for two columns
  const row1 = weddingEvents.slice(0, 2);
  const row2 = weddingEvents.slice(2, 4);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-800">Wedding Journey</h3>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
        {/* "All Events" gets its own row at the top */}
        <div className="mb-3">
          {events
            .filter(event => event.id === 'all')
            .map(event => {
              const photoCount = getEventPhotoCount(event.id);
              const isSelected = selectedEvent === event.id;
              const Icon = event.icon;

              return (
                <button
                  key={event.id}
                  onClick={() => onEventSelect(event.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r ' + event.color + ' text-white shadow-lg scale-105'
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Timeline dot */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        {event.emoji ? (
                          <span className="text-lg">{event.emoji}</span>
                        ) : (
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        )}
                      </div>

                      {/* Event details */}
                      <div>
                        <h4 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                          {event.name}
                        </h4>
                        <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {event.description}
                        </p>
                      </div>
                    </div>

                    {/* Photo count */}
                    <div className={`flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      <Camera className="w-4 h-4" />
                      <span className="text-sm font-medium">{photoCount}</span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        {/* First row of events - explicit flex row */}
        <div className="flex flex-row gap-2 mb-2">
          {row1.map((event) => {
            const photoCount = getEventPhotoCount(event.id);
            const isSelected = selectedEvent === event.id;
            const Icon = event.icon;

            return (
              <button
                key={event.id}
                onClick={() => onEventSelect(event.id)}
                className={`flex-1 text-left p-2 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r ' + event.color + ' text-white shadow-lg scale-105'
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Timeline dot - smaller on mobile */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {event.emoji ? (
                        <span className="text-sm">{event.emoji}</span>
                      ) : (
                        <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      )}
                    </div>

                    {/* Event details - smaller text on mobile */}
                    <div>
                      <h4 className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {event.name}
                      </h4>
                      <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Photo count - smaller on mobile */}
                  <div className={`flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    <Camera className="w-3 h-3" />
                    <span className="text-xs font-medium">{photoCount}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Second row of events - explicit flex row */}
        <div className="flex flex-row gap-2">
          {row2.map((event) => {
            const photoCount = getEventPhotoCount(event.id);
            const isSelected = selectedEvent === event.id;
            const Icon = event.icon;

            return (
              <button
                key={event.id}
                onClick={() => onEventSelect(event.id)}
                className={`flex-1 text-left p-2 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r ' + event.color + ' text-white shadow-lg scale-105'
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Timeline dot - smaller on mobile */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {event.emoji ? (
                        <span className="text-sm">{event.emoji}</span>
                      ) : (
                        <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      )}
                    </div>

                    {/* Event details - smaller text on mobile */}
                    <div>
                      <h4 className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {event.name}
                      </h4>
                      <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Photo count - smaller on mobile */}
                  <div className={`flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    <Camera className="w-3 h-3" />
                    <span className="text-xs font-medium">{photoCount}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeddingTimeline;
