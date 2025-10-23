import { RadarQuadrant, RadarRing, Blip } from '../../infrastructure';

export const blips: Blip[] = [
  { id: 'e7b1f8f0-3c4a-4b1a-9d2e-1a2b3c4d5e01', title: 'TypeScript', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.ADOPT, previousRing: RadarRing.TEST },
  { id: 'a3f2d9c8-9b2a-4e5f-8a1b-2c3d4e5f6a02', title: 'Rust', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.TEST, previousRing: RadarRing.TEST },
  { id: 'b4c3d2e1-7f6a-4b5c-9d8e-3f2a1b0c4d03', title: 'Kotlin', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.SUSTAIN, previousRing: RadarRing.SUSTAIN },
  { id: 'c5d4e3f2-6a5b-4c3d-8e7f-4a3b2c1d5e04', title: 'Perl', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.HOLD, previousRing: RadarRing.SUSTAIN },
  { id: 'd6e5f4a3-5b4c-4d3e-9f8a-5b4c3d2e6f05', title: 'React Query', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.ADOPT, previousRing: RadarRing.ADOPT },
  { id: 'e7f6a5b4-4c3d-4e2f-8a9b-6c5d4e3f7a06', title: 'Playwright', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.TEST, previousRing: RadarRing.ADOPT },
  { id: 'f8a7b6c5-3d2e-4f1a-9b0c-7d6e5f4a8b07', title: 'Vite', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.SUSTAIN, previousRing: RadarRing.TEST },
  { id: '09b8c7d6-2e1f-4a3b-8c9d-8e7f6a5b9c08', title: 'Gulp', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.HOLD, previousRing: RadarRing.HOLD },
  { id: '1ac9b8d7-1f2e-4b3c-9d0e-9f8a7b6c0d09', title: 'Docker', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.ADOPT, previousRing: RadarRing.SUSTAIN },
  { id: '2bdad9e8-0f1e-4c5d-8a2b-0a9b8c7d1e10', title: 'Kubernetes', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.TEST, previousRing: RadarRing.TEST },
  { id: '3cedea19-9f0e-4d6c-8b3a-1b0c9d8e2f11', title: 'Nomad', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.SUSTAIN, previousRing: RadarRing.SUSTAIN },
  { id: '4dfefb2a-8e1d-4e7b-9c4a-2c1b0a9d3f12', title: 'FTP', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.HOLD, previousRing: RadarRing.HOLD },
  { id: '5e0f0c3b-7d2c-4f8a-9d5b-3d2c1b0a4e13', title: 'Redux Toolkit', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.ADOPT, previousRing: RadarRing.ADOPT },
  { id: '6f102d4c-6c3b-4a9b-8e6c-4e3d2c1b5f14', title: 'Server Components', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.TEST, previousRing: RadarRing.TEST },
  { id: '70123e5d-5b4a-4b8c-9f7d-5f4e3d2c6a15', title: 'Microfrontends', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.SUSTAIN, previousRing: RadarRing.TEST },
  { id: '81234f6e-4a39-4c7d-8e8c-6a5b4c3d7b16', title: 'jQuery Plugins', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.HOLD, previousRing: RadarRing.HOLD },
  { id: '9234507f-3b28-4d6e-9f9b-7b6c5d4e8c17', title: 'Go', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.ADOPT, previousRing: RadarRing.ADOPT },
  { id: 'a3456180-2c17-4e5f-8a0b-8c7d6e5f9d18', title: 'Elm', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.TEST, previousRing: RadarRing.SUSTAIN },
  { id: 'b4567291-1d06-4f4a-9b1c-9d8e7f6a0e19', title: 'Dart', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.SUSTAIN, previousRing: RadarRing.SUSTAIN },
  { id: 'c56783a2-0e15-4e39-8c2d-0e9f8a7b1f20', title: 'Visual Basic', quadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, ring: RadarRing.HOLD, previousRing: RadarRing.HOLD },
  { id: 'd67894b3-ff04-4d28-9b3e-1f0a9b8c2e21', title: 'ESLint', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.ADOPT, previousRing: RadarRing.ADOPT },
  { id: 'e789a5c4-ee03-4c17-8a4f-2a1b0c9d3f22', title: 'Cypress', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.TEST, previousRing: RadarRing.TEST },
  { id: 'f89ab6d5-dd02-4b06-9b5e-3b2c1d0e4f23', title: 'Snowpack', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.SUSTAIN, previousRing: RadarRing.SUSTAIN },
  { id: '09abc7e6-cc01-4a95-8c6d-4c3d2e1f5a24', title: 'Bower', quadrant: RadarQuadrant.BUSSINESS_INTEL, ring: RadarRing.HOLD, previousRing: RadarRing.HOLD },
  { id: '1abcd8f7-ba90-4f84-9d7c-5d4e3f2a6b25', title: 'Terraform', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.ADOPT, previousRing: RadarRing.TEST },
  { id: '2bcde9g8-a981-4e73-8e8b-6e5f4a3b7c26', title: 'Consul', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.TEST, previousRing: RadarRing.TEST },
  { id: '3cdef0h9-9982-4d62-9f9a-7f6a5b4c8d27', title: 'Podman', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.SUSTAIN, previousRing: RadarRing.SUSTAIN },
  { id: '4def01ia-8873-4c51-8a0a-8a7b6c5d9e28', title: 'Telnet', quadrant: RadarQuadrant.SCIENTIFIC_STAGE, ring: RadarRing.HOLD, previousRing: RadarRing.HOLD },
  { id: '5ef012jb-7764-4b40-9b1b-9b8c7d6e0f29', title: 'Atomic Design', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.ADOPT, previousRing: RadarRing.ADOPT },
  { id: '6f0123kc-6655-4a2f-8c2c-0c9d8e7f1a30', title: 'Feature Flags', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.TEST, previousRing: RadarRing.TEST },
  { id: '701234ld-5546-4b1e-9d3d-1d0a9b8c2e31', title: 'Serverless Patterns', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.SUSTAIN, previousRing: RadarRing.SUSTAIN },
  { id: '812345me-4437-4c0d-8e4e-2e1b0c9d3f32', title: 'CSS Hacks', quadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, ring: RadarRing.HOLD, previousRing: RadarRing.HOLD }
];

export default blips;
