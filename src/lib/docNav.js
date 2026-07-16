import { getCollection } from 'astro:content';

export async function getDocNav() {
  const security = await getCollection('security');
  const compliance = await getCollection('compliance');

  const collectionDocs = [
    ...security.map(d => ({ href: `/trust-center/${d.id}`, title: d.data.title, sort: d.data.document_id })),
    ...compliance.map(d => ({ href: `/trust-center/${d.id}`, title: d.data.title, sort: d.data.document_id })),
  ].sort((a, b) => a.sort.localeCompare(b.sort));

  return [
    ...collectionDocs,
    { href: '/trust-center/legal/data-processing-agreement', title: 'Data Processing Agreement', sort: 'ZZ-1' },
    { href: '/trust-center/sub-processor-list', title: 'Sub-processor List', sort: 'ZZ-2' },
  ];
}
