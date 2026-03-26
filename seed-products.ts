import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const GRADES = [
  { name: 'Inicial 1', level: 'Inicial', price: 250 },
  { name: 'Inicial 2', level: 'Inicial', price: 250 },
  { name: 'EGB 1', level: 'EGB', price: 300 },
  { name: 'EGB 2', level: 'EGB', price: 300 },
  { name: 'EGB 3', level: 'EGB', price: 300 },
  { name: 'EGB 4', level: 'EGB', price: 300 },
  { name: 'EGB 5', level: 'EGB', price: 300 },
  { name: 'EGB 6', level: 'EGB', price: 300 },
  { name: 'EGB 7', level: 'EGB', price: 320 },
  { name: 'EGB 8', level: 'EGB', price: 320 },
  { name: 'EGB 9', level: 'EGB', price: 320 },
  { name: 'EGB 10', level: 'EGB', price: 320 },
  { name: 'BGU 1', level: 'BGU', price: 350 },
  { name: 'BGU 2', level: 'BGU', price: 350 },
  { name: 'BGU 3', level: 'BGU', price: 350 },
]

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'colegio-demo' },
  })
  
  if (!tenant) {
    console.error('Tenant not found')
    return
  }

  console.log(`Creating ${GRADES.length} products for tenant ${tenant.id}...`)

  for (const grade of GRADES) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: grade.name,
        level: grade.level,
        price: grade.price,
        active: true,
      }
    })
  }

  console.log('Products created successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
