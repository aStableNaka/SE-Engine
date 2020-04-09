# Notes for using Blender to create GLTF models
Refer to these notes when using blender to make models

# Models
GLTFModels implementations by default only allow single-object meshes with an additional static shadow object.
This blender object can have any name other than "shadow", otherwise it will cause complications.

TODO: Remove this limitation

# Exporting
All models must be in the form of GLTF.
To export models from blender, you need the GLTF-IO addon, available on github.
Always export models as gltf.

# Model transformations
Models can be transformed after export if they need to be. This transformation
can be configured through the ModelOptions object when creating a model.

# Transparency
You must change a few material settings in blender if you wish to use
transparency on a material.

These settings are as follows:
* Blend Mode: `Alpha Clip`
* Shadow Mode: `Opaque`
* Clip Threshold: Adjust according to need

# Static Shadows
To add a static shadow to a model, you must create a new object
named "shadow"

To create the texture, bake a shadow map of the parent object
with a sun light source 10 units above it.