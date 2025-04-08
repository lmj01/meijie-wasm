#include <string>
#include <vector>
#include <iostream>

#include <draco/io/file_utils.h>
#include <draco/io/mesh_io.h>
#include <draco/io/gltf_decoder.h>
#include <draco/io/gltf_encoder.h>
// ref: https://github.com/google/draco/issues/770  https://github.com/google/draco/issues/750

int main(int argc, char* argv[])
{

	// ---------- Import File -----------

	const std::string glbPath = argv[1];
	
	draco::GltfDecoder gltfDecoder;
	auto glbMesh = gltfDecoder.DecodeFromFile(glbPath);
	if (!glbMesh.ok()) {
		std::cout << "Failed loading the input mesh: %s.\n" << glbMesh.status().error_msg() << std::endl;
		return -1;
	}
	

	draco::Mesh *dmesh = glbMesh.value().get();
	int tris = dmesh->num_faces();
	int verts = dmesh->num_points();

	std::vector<std::vector<float> > vertices;
	std::vector<int> indices;
	vertices.resize(verts);
	indices.resize(tris * 3);

	// laod vertex positions
	auto attr = dmesh->GetNamedAttribute(draco::GeometryAttribute::POSITION);
	if (attr == nullptr) {
		return -1;
	}

	float vector[3];
	switch (attr->data_type())
	{
	case draco::DataType::DT_FLOAT32:
		if (attr->num_components() != 3)
		{
			std::cout << "Error: Invalid number of components in compressed mesh position attribute" << std::endl;
			return -1;
		}
		if (attr->byte_stride() > 16)
		{
			std::cout << "Error: Attribute byte stride is too long" << std::endl;
			return -1;
		}
		for (int v = 0; v < verts; v++)
		{
			attr->GetMappedValue(draco::PointIndex(v), &vector[0]);
			vertices[v].push_back(vector[0]);
			vertices[v].push_back(vector[1]);
			vertices[v].push_back(vector[2]);
		}
		break;
	default:
		std:: cout << "Error: Invalid data type in compressed mesh position attribute" << std::endl;
		return -1;
		break;
	}

	//Load triangle indices
	for (int t = 0; t < tris; ++t)
	{
		indices[3 * t] = dmesh->face(draco::FaceIndex(t))[0].value();
		indices[3 * t + 1] = dmesh->face(draco::FaceIndex(t))[1].value();
		indices[3 * t + 2] = dmesh->face(draco::FaceIndex(t))[2].value();
	}

	std::cout << "vertices size: " << vertices.size() << " first item: " << vertices[0][0] << " " << vertices[0][1] << " " << vertices[0][2] << std::endl;
	std::cout << "indices size: " << indices.size() << " first face id: " << indices[0] << " " << indices[1] << " " << indices[2] << std::endl;

	// ---------- Export File -----------

	std::vector<std::vector<float> > cubeCoords;
	cubeCoords.resize(8);
	std::vector<int> cubeIndices;
	cubeIndices.resize(36);
	
	cubeCoords[0] = { 1.0f, -1.0f, 1.0f };
	cubeCoords[1] = { -1.0f, -1.0f, 1.0f };
	cubeCoords[2] = { -1.0f, 1.0f, 1.0f };
	cubeCoords[3] = { 1.0f, 1.0f, 1.0f };
	cubeCoords[4] = { 1.0f, 1.0f, -1.0f };
	cubeCoords[5] = { -1.0f, 1.0f, -1.0f };
	cubeCoords[6] = { -1.0f, -1.0f, -1.0f };
	cubeCoords[7] = { 1.0f, -1.0f, -1.0f };

	cubeIndices = { 2, 1, 0, 0, 3, 2, 2, 3, 4, 4, 5, 2, 5, 4, 7, 6, 5, 7, 1, 2, 5, 5, 6, 1, 1, 6, 7, 7, 0, 1, 0, 4, 3, 0, 7, 4 };

	
	draco::Mesh::Face cubeFace;
	// Define vertex layout
	int numFace = cubeIndices.size() / 3;
	draco::TriangleSoupMeshBuilder builder;
	builder.Start(numFace);
	
	int positionIndex = builder.AddAttribute(draco::GeometryAttribute::POSITION, 3, draco::DT_FLOAT32);

        // Insert vertex data and faces into dracoMesh
	for (int i = 0; i < numFace; ++i) {
		const std::vector<float>& v0 = cubeCoords[cubeIndices[i * 3]];
		const std::vector<float>& v1 = cubeCoords[cubeIndices[i * 3 + 1]];
		const std::vector<float>& v2 = cubeCoords[cubeIndices[i * 3 + 2]];

		builder.SetAttributeValuesForFace(positionIndex, draco::FaceIndex(i), (const void*)&v0[0], (const void*)&v1[0], (const void*)&v2[0]);
	}
	auto dracoMesh = builder.Finalize();

	draco::GltfEncoder gltfEncoder;
	std::string cubePath = argc > 2 ? argv[2] :  "./cube.glb";
	draco::DracoCompressionOptions compressOptions;
	int compressionLevel = 6;  // compression level [0-10], most=10, least=0.
	draco::SpatialQuantizationOptions qbPosition{16};
	compressOptions.compression_level = compressionLevel;
	compressOptions.quantization_position = qbPosition;
	dracoMesh->SetCompressionEnabled(true);
	dracoMesh->SetCompressionOptions(compressOptions);
	gltfEncoder.EncodeFile(*dracoMesh, cubePath);
	return 0;
}

