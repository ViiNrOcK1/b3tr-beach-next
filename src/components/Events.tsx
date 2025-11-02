"use client"; // Ensures client-side rendering for localStorage and hooks

import React, { useState, useEffect, useRef } from 'react'; // Explicitly import React
import Link from 'next/link'; // For client-side navigation
import { useRouter } from 'next/navigation';

// 1. Renamed interface to avoid conflict with browser's built-in Event type
interface AppEvent {
  name: string;
  month: string;
  day: string;
  year: string;
  time: string;
  location: string;
  description: string;
}

interface EventCounts {
  [key: string]: number; // Map event names to counts
}

interface EventsComponentProps {
  showManageForm: boolean;
  setShowManageForm: (show: boolean) => void;
}

interface FooterProps {
  setShowManageForm: (show: boolean) => void;
}

function Header() {
  return (
    <header className="py-40 relative" style={{ backgroundImage: "url('/assets/AltBEACHBanner.png')", backgroundSize: '1700px 400px', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#000' }}>
      <div className="container mx-auto px-4 text-center">
        <div className="fade-content">
          <h1 className="text-6xl text-amber-400 font-bold text-outline-black">
            B3TR{' '}
            <span className="text-custom-blue">BEACH</span> Events
          </h1>
        </div>
      </div>
    </header>
  );
}

function EventsComponent({ showManageForm: initialShowManageForm, setShowManageForm }: EventsComponentProps) {
  const router = useRouter();
  const [events, setEvents] = useState<AppEvent[]>([]); // Use AppEvent
  const [counters, setCounters] = useState<EventCounts>({});
  const [formEvent, setFormEvent] = useState<AppEvent>({ // Use AppEvent
    name: '',
    month: '01',
    day: '01',
    year: '2025',
    time: '09:00',
    location: '',
    description: '',
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const sortEvents = (eventsArray: AppEvent[]) => { // Use AppEvent
    return eventsArray.sort((a, b) => {
      const dateA = new Date(`${a.year}-${a.month}-${a.day} ${a.time}`);
      const dateB = new Date(`${b.year}-${b.month}-${b.day} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  useEffect(() => {
    const updateData = () => {
      let loadedEvents: AppEvent[] = JSON.parse(localStorage.getItem('b3tr_events') || '[]'); // Use AppEvent
      if (loadedEvents.length === 0 && !localStorage.getItem('events_initialized')) {
        const defaultEvents: AppEvent[] = [ // Use AppEvent
          { name: 'Community Clean Up', month: '12', day: '05', year: '2025', time: '09:00', location: 'Local Beach', description: 'Join Us to remove marine debris and earn B3TR tokens and XP' },
          { name: 'Beach Clean Up', month: '01', day: '10', year: '2026', time: '09:00', location: 'Coastal Area', description: 'Help collect debris and earn exclusive merchandise' },
          { name: 'River Restoration', month: '02', day: '15', year: '2026', time: '09:00', location: 'Riverbank', description: 'Support river cleanup and earn XP' },
        ];
        localStorage.setItem('b3tr_events', JSON.stringify(defaultEvents));
        localStorage.setItem('events_initialized', 'true');
        loadedEvents = defaultEvents;
      }
      const sortedLoadedEvents = sortEvents(loadedEvents);
      setEvents(sortedLoadedEvents);
      const today = new Date();
      const filteredEvents = sortedLoadedEvents.filter(event => {
        const eventDate = new Date(`${event.year}-${event.month}-${event.day} ${event.time}`);
        const resetDate = new Date(eventDate);
        resetDate.setDate(eventDate.getDate() + 1);
        if (today >= resetDate) {
          const counterKey = event.name.toLowerCase().replace(/\s+/g, '_') + '_counter';
          localStorage.setItem(counterKey, '0');
          console.log(`Reset counter for past event ${event.name}`);
          return false;
        }
        return true;
      });
      const storedCounts = localStorage.getItem('eventCounts');
      const eventCounts: EventCounts = storedCounts ? JSON.parse(storedCounts) : {};
      const updatedCounters: EventCounts = {};
      filteredEvents.forEach(event => {
        updatedCounters[event.name] = eventCounts[event.name] || 0;
      });
      setCounters(updatedCounters);
      setEvents(filteredEvents);
      setIsLoading(false);
      const storedRegistrations = localStorage.getItem('registrations');
      if (storedRegistrations) {
        const parsedRegistrations = JSON.parse(storedRegistrations);
        setRegistrations(parsedRegistrations);
      }
    };
    updateData();
  }, []);

  useEffect(() => {
    // 2. Corrected handleUpdate to use the built-in Event type
    const handleUpdate = (e: Event) => {
      const detail = e instanceof CustomEvent ? e.detail : null;
      console.log('Event triggered:', e.type, detail ? 'Detail:' + JSON.stringify(detail) : 'No detail');
      const storedRegistrations = localStorage.getItem('registrations');
      if (storedRegistrations) {
        const parsedRegistrations = JSON.parse(storedRegistrations);
        setRegistrations(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsedRegistrations)) {
            return parsedRegistrations;
          }
          return prev;
        });
      }
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('registrationsUpdated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('registrationsUpdated', handleUpdate);
    };
  }, []);

  const handleRegister = (eventName: string) => {
    router.push(`/forms?event=${encodeURIComponent(eventName)}`);
  };

  const handleViewRegistrations = () => {
    router.push('/registrations');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEvent.name || !formEvent.month || !formEvent.day || !formEvent.year || !formEvent.time || !formEvent.location || !formEvent.description) {
      alert('Please fill in all event fields.');
      return;
    }
    let updatedEvents: AppEvent[] = [...events]; // Use AppEvent
    if (editIndex !== null) {
      updatedEvents[editIndex] = formEvent;
    } else if (events.length >= 3) {
      const eventToDelete = prompt(`Three events already exist. Please enter the name of the event to delete:\n${events.map(e => e.name).join('\n')}`);
      if (eventToDelete) {
        const deleteIndex = events.findIndex(e => e.name === eventToDelete);
        if (deleteIndex !== -1) {
          updatedEvents.splice(deleteIndex, 1);
          updatedEvents.push(formEvent);
        } else {
          alert('Invalid event name. No changes made.');
          return;
        }
      } else {
        alert('No event selected. No changes made.');
        return;
      }
    } else {
      updatedEvents.push(formEvent);
    }
    const sortedUpdatedEvents = sortEvents(updatedEvents);
    setEvents(sortedUpdatedEvents);
    localStorage.setItem('b3tr_events', JSON.stringify(sortedUpdatedEvents));
    setFormEvent({ name: '', month: '01', day: '01', year: '2025', time: '09:00', location: '', description: '' });
    setEditIndex(null);
  };

  const handleSaveChanges = () => {
    localStorage.setItem('b3tr_events', JSON.stringify(events));
    setShowManageForm(false);
  };

  const handleEditEvent = (index: number) => {
    setFormEvent(events[index]);
    setEditIndex(index);
  };

  const handleDeleteEvent = (index: number) => {
    if (window.confirm(`Are you sure you want to delete the event "${events[index].name}"?`)) {
      const eventName = events[index].name;
      const updatedEvents = events.filter((_, i) => i !== index);
      const sortedUpdatedEvents = sortEvents(updatedEvents);
      setEvents(sortedUpdatedEvents);
      localStorage.setItem('b3tr_events', JSON.stringify(sortedUpdatedEvents));
      const counterKey = eventName.toLowerCase().replace(/\s+/g, '_') + '_counter';
      localStorage.setItem(counterKey, '0');
      setCounters(prev => ({ ...prev, [eventName]: 0 }));
      // 3. Fixed bug by using eventName instead of the undefined 'event'
      const updatedRegistrations = registrations.filter(reg => reg.events && !reg.events.includes(eventName));
      localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
      setRegistrations(updatedRegistrations);
    }
  };

  const paddedEvents = [...events.slice(0, 3)];
  while (paddedEvents.length < 3) {
    paddedEvents.push({ name: 'Event Coming Soon...', month: '', day: '', year: '', time: '', location: '', description: 'Stay tuned for more details' });
  }

  return (
    <section id="events" className="bg-gray-100 py-20 wave-top wave-bottom" style={{ backgroundImage: "url('/assets/SeaShell.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="container mx-auto px-4 text-center">
        <div className="fade-content fade-in">
          {isLoading ? (
            <p>Loading B3TR BEACH... If this message persists, please enable JavaScript or check your internet connection.</p>
          ) : (
            <>
              <h2 className="text-4xl text-amber-400 font-bold mb-8 text-outline-black">Join Our Clean Up Events</h2>
              <p className="text-lg mb-6">
                Participate in{' '}
                <span className="text-custom-blue text-outline-black">B3TR BEACH</span> clean up events to earn XP points and{' '}
                <span className="text-custom-blue text-outline-black">B3TR</span> tokens while helping to protect our beaches and waterways!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paddedEvents.map((event, index) => (
                  <div key={event.name + index} className="bg-custom-blue p-4 rounded-lg shadow text-center relative">
                    <p
                      className={`text-2xl font-bold ${
                        index === 0 ? 'text-amber-300 text-outline-black ' : index === 2 && event.name === 'Event Coming Soon...' ? 'text-green-300 text-outline-black' : 'text-white'
                      }`}
                    >
                      {event.name}
                    </p>
                    <p className="text-lg text-white text-outline-black">
                      {event.month && event.day && event.year && event.time ? (
                        <>
                          Date: {`${event.month}/${event.day}/${event.year}`} <br />
                          Time: {event.time} <br />
                          Location: {event.location} <br />
                          Description: {event.description}
                        </>
                      ) : (
                        `Location: ${event.location} ${event.description}`
                      )}
                    </p>
                    {event.name !== 'Event Coming Soon...' ? (
                      <Link
                        href={{ pathname: '/forms', query: { event: encodeURIComponent(event.name) } }}
                        className="bg-amber-400 text-green-500 text-2xl font-bold px-2 py-1 rounded-lg mt-4 inline-block hover:bg-black hover:text-white text-outline-black"
                        onClick={() => handleRegister(event.name)}
                      >
                        Register
                      </Link>
                    ) : null}
                    <span className="event-counter text-amber-400 text-sm">
                      Registered: {counters[event.name] || 0}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <h3 className="text-2xl text-amber-400 font-bold mb-4 text-outline-black ">Registered Participants</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {events.map(event => (
                    <div key={event.name} className="bg-custom-blue p-4 rounded-lg shadow">
                      <h4 className="text-xl font-bold">{event.name}</h4>
                      <ul className="text-left">
                        {registrations.length > 0 && registrations.filter(reg => reg.events && reg.events.includes(event.name)).length > 0
                          ? registrations.filter(reg => reg.events && reg.events.includes(event.name)).map((reg, index) => (
                              <li key={index}>{`${reg.firstName} ${reg.lastName}, Age: ${reg.age}`}</li>
                            ))
                          : <li>No registrations yet</li>}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              {initialShowManageForm && (
                <div className="bg-white p-4 rounded-lg shadow mx-auto max-w-2xl mt-6">
                  <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                      <label className="block text-lg font-bold">Event Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={formEvent.name}
                        onChange={e => setFormEvent({ ...formEvent, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-4 flex space-x-2">
                      <div>
                        <label className="block text-lg font-bold">Month</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={formEvent.month}
                          onChange={e => setFormEvent({ ...formEvent, month: e.target.value.padStart(2, '0') })}
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-lg font-bold">Day</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={formEvent.day}
                          onChange={e => setFormEvent({ ...formEvent, day: e.target.value.padStart(2, '0') })}
                        >
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-lg font-bold">Year</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={formEvent.year}
                          onChange={e => setFormEvent({ ...formEvent, year: e.target.value })}
                        >
                          {Array.from({ length: 5 }, (_, i) => (
                            <option key={2025 + i} value={(2025 + i).toString()}>
                              {2025 + i}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-lg font-bold">Time</label>
                      <input
                        type="time"
                        className="w-full p-2 border rounded-lg"
                        value={formEvent.time}
                        onChange={e => setFormEvent({ ...formEvent, time: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-lg font-bold">Location</label>
                      <input
                        ref={locationInputRef}
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={formEvent.location}
                        onChange={e => setFormEvent({ ...formEvent, location: e.target.value })}
                        placeholder="Type to search locations..."
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-lg font-bold">Description</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={formEvent.description}
                        onChange={e => setFormEvent({ ...formEvent, description: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-400 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white"
                    >
                      {editIndex !== null ? 'Update Event' : 'Add Event'}
                    </button>
                    <button
                      type="button"
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold ml-4"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold ml-4"
                      onClick={() => setShowManageForm(false)}
                    >
                      Cancel
                    </button>
                  </form>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">Current Events</h3>
                    {events.map((event, index) => (
                      <div key={event.name + index} className="flex justify-between items-center mb-2">
                        <span>{event.name}</span>
                        <div>
                          <button
                            className="bg-blue-600 text-white px-2 py-1 rounded-lg mr-2"
                            onClick={() => handleEditEvent(index)}
                          >
                            Edit
                          </button>
                          <button className="delete-button" onClick={() => handleDeleteEvent(index)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/registrations"
                    className="text-amber-400 hover:text-white text-lg mt-4 inline-block"
                  >
                    View Full Registrant Details (Private)
                  </Link>
                </div>
              )}
              <div className="text-center">
                <br />
                <a href="/" className="bg-amber-400 text-green-500 text-2xl font-bold px-2 py-2 rounded-lg hover:bg-black hover:text-white text-outline-black">
                  Back to Main Page
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer({ setShowManageForm }: FooterProps) {
  return (
    <footer className="bg-amber-400 py-6 wave-top">
      <div className="container mx-auto px-4 text-center">
        <div className="fade-content">
          <p className="text-xl text-amber-400 text-outline-black mb-4">
            © 2025{' '}
            <span className="text-custom-blue">B3TR</span> BEACH. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white hover:text-blue-400 text-xl">
              Privacy Policy
            </a>
            <a href="#" className="text-white hover:text-blue-400 text-xl">
              Terms of Service
            </a>
            <a
              href="#"
              className="bg-amber-400 text-white hover:text-blue-400 text-xl"
              onClick={(e) => {
                e.preventDefault();
                const password = prompt('Enter password to manage events:');
                if (password === 'b3tr2025') {
                  setShowManageForm(true);
                } else {
                  alert('Incorrect password');
                }
              }}
            >
              Manage Events
            </a>
            <a href="mailto:support@b3trbeach.com" className="text-white hover:text-blue-400 text-xl">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Events({ manage }: { manage?: boolean }) {
  const [showManageForm, setShowManageForm] = useState(false);

  useEffect(() => {
    if (manage) {
      setShowManageForm(true);
    }
  }, [manage]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.fade-content');
    elements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div>
      <Header />
      <EventsComponent showManageForm={showManageForm} setShowManageForm={setShowManageForm} />
      <Footer setShowManageForm={setShowManageForm} />
    </div>
  );
}