import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Veuillez définir la variable MONGODB_URI dans .env.local');
}

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('form_submissions');

    if (id) {
      const entry = await collection.findOne({ _id: new ObjectId(id) });
      if (!entry) {
        return NextResponse.json(
          { success: false, message: 'Entrée non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    const entries = await collection.find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      data: entries,
      count: entries.length 
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur GET /api/entries:', error.message, error.stack);
    } else {
      console.error('Erreur GET /api/entries:', error);
    }
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;
    const country = formData.get('country') as string;
    const password = formData.get('password') as string;
    const acceptTerms = formData.get('acceptTerms') === 'true';
    
    if (!firstName || !acceptTerms || !country) {
      return NextResponse.json(
        { success: false, message: 'Champs requis manquants' },
        { status: 400 }
      );
    }
    
    const photos = formData.getAll('photos') as File[];
    const savedPhotos = [];
    
    if (photos && photos.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      for (const photo of photos) {
        if (photo instanceof File && photo.size > 0) {
          const bytes = await photo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const ext = path.extname(photo.name);
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = path.join(uploadDir, fileName);
          
          await fs.writeFile(filePath, buffer);
          savedPhotos.push(`/uploads/${fileName}`);
        }
      }
    }
    
    const newEntry = {
      firstName,
      lastName: lastName || '',
      email: email || '',
      bio: bio || '',
      country,
      photos: savedPhotos,
      acceptTerms,
      createdAt: new Date()
    };
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('form_submissions');
    const result = await collection.insertOne(newEntry);
    
    console.log('Nouvelle entrée créée:', newEntry);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Entrée créée avec succès',
      data: { ...newEntry, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error('Erreur POST:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID requis' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('form_submissions');
    
    const existingEntry = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, message: 'Entrée non trouvée' },
        { status: 404 }
      );
    }
    
    const formData = await request.formData();
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;
    const country = formData.get('country') as string;
    
    const existingPhotosStr = formData.get('existingPhotos') as string;
    const existingPhotos = existingPhotosStr ? JSON.parse(existingPhotosStr) : [];
    
    const newPhotos = formData.getAll('newPhotos') as File[];
    
    const savedPhotos = [];
    if (newPhotos && newPhotos.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      for (const photo of newPhotos) {
        if (photo instanceof File && photo.size > 0) {
          const bytes = await photo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const ext = path.extname(photo.name);
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = path.join(uploadDir, fileName);
          
          await fs.writeFile(filePath, buffer);
          savedPhotos.push(`/uploads/${fileName}`);
        }
      }
    }
    
    const updateData: any = {
      firstName: firstName || existingEntry.firstName,
      lastName: lastName !== undefined ? lastName : existingEntry.lastName,
      email: email !== undefined ? email : existingEntry.email,
      bio: bio !== undefined ? bio : existingEntry.bio,
      country: country || existingEntry.country,
      photos: [...existingPhotos, ...savedPhotos],
      updatedAt: new Date()
    };
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    const updatedEntry = await collection.findOne({ _id: new ObjectId(id) });
    
    console.log('Entrée mise à jour:', updatedEntry);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Entrée mise à jour avec succès',
      data: updatedEntry 
    });
    
  } catch (error) {
    console.error('Erreur PUT:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID requis' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('form_submissions');
    
    const entry = await collection.findOne({ _id: new ObjectId(id) });
    if (!entry) {
      return NextResponse.json(
        { success: false, message: 'Entrée non trouvée' },
        { status: 404 }
      );
    }
    
    if (entry.photos && entry.photos.length > 0) {
      for (const photoPath of entry.photos) {
        try {
          const fullPath = path.join(process.cwd(), 'public', photoPath);
          await fs.unlink(fullPath);
        } catch (error) {
          console.warn('Impossible de supprimer la photo:', photoPath, error);
        }
      }
    }
    
    await collection.deleteOne({ _id: new ObjectId(id) });
    
    console.log('Entrée supprimée:', entry);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Entrée supprimée avec succès',
      data: entry 
    });
    
  } catch (error) {
    console.error('Erreur DELETE:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
