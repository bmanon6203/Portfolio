import { NextRequest, NextResponse } from 'next/server';
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID manquant' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID invalide' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('form_submissions');

    let deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
    if (deleteResult.deletedCount === 0) {
      deleteResult = await collection.deleteOne({
        $or: [
          { _id: new ObjectId(id) },
          { _id: id as any }
        ]
      });
    }
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Entrée non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Entrée supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur DELETE:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID manquant' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID invalide' },
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

    return NextResponse.json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Erreur GET:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID manquant' },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID invalide' },
        { status: 400 }
      );
    }
    const contentType = request.headers.get('content-type') || '';
    let fieldsToUpdate: Record<string, any> = {};
    let allPhotos: string[] = [];
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'existingPhotos') {
          allPhotos = value ? JSON.parse(value as string) : [];
        }
      }
      const savedPhotos: string[] = [];
      const pathModule = await import('path');
      const fsModule = await import('fs');
      const uploadDir = pathModule.join(process.cwd(), 'public/uploads');
      if (!fsModule.existsSync(uploadDir)) fsModule.mkdirSync(uploadDir, { recursive: true });
      const processedKeys = new Set();
      for (const [key, value] of formData.entries()) {
        if (key === 'existingPhotos') continue;
        if (processedKeys.has(key)) continue;
        const allValues = formData.getAll(key);
        let isFileField = false;
        for (const v of allValues) {
          if (v instanceof File && v.size > 0) {
            isFileField = true;
            const arrayBuffer = await v.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const timestamp = Date.now();
            const filename = `${timestamp}-${v.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filepath = pathModule.join(uploadDir, filename);
            fsModule.writeFileSync(filepath, buffer);
            savedPhotos.push(`/uploads/${filename}`);
          }
        }
        if (!isFileField && allValues.length === 1) {
          fieldsToUpdate[key] = allValues[0];
        } else if (!isFileField && allValues.length > 1) {
          fieldsToUpdate[key] = allValues;
        }
        processedKeys.add(key);
      }
      fieldsToUpdate.photos = [...allPhotos, ...savedPhotos];
    } else {
      const updateData = await request.json();
      const { _id, createdAt, ...rest } = updateData;
      fieldsToUpdate = rest;
    }
    fieldsToUpdate.updatedAt = new Date();
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('form_submissions');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: fieldsToUpdate }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Entrée non trouvée' },
        { status: 404 }
      );
    }
    const updatedEntry = await collection.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'Entrée mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur PUT:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
