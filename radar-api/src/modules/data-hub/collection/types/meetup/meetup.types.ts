// Basado en la API pública de Meetup/Meetup Pro (actualmente disponible para ciertos partners)
export type MeetupGroup = {
    id: number;
    name: string;
    urlname: string;
    description: string;
    created: number;
    city: string;
    country: string;
    members: number;
    topics: { name: string }[];
};

export type MeetupEvent = {
    id: string;
    name: string;
    status: 'upcoming' | 'past';
    time: number;
    description: string;
    link: string;
    group: {
        name: string;
        urlname: string;
    };
    yes_rsvp_count: number;
};
