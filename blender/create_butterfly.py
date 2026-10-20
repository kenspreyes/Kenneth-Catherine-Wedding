"""K&C Butterfly Studio — Blender 4.x+ optional model generator.

Usage:
  1. Open Blender, switch to Scripting, paste/open this file.
  2. Press Run Script.
  3. The butterfly model and its wing-flap keyframes are created.
  4. File > Export > glTF 2.0 (.glb), select 'Animation'.

The standalone WebGL preview does NOT require Blender or this model.
This script is an optional starting point for a higher-detail GLB asset.
"""
import bpy
import math
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 48
scene.render.fps = 24

def mat(name, color, metallic=0, roughness=0.72):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    node = m.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Metallic'].default_value = metallic
    node.inputs['Roughness'].default_value = roughness
    return m

olive = mat('Sage olive wing', (.36,.48,.32))
cream = mat('Champagne wing markings', (.85,.79,.62))
vein = mat('Dark olive veins', (.23,.34,.24))
bodymat = mat('Velvet dark green body', (.18,.27,.18))
spotmat = mat('Pale gold wing spots', (.94,.89,.72))

# Four wings, with each object hinged at the body origin.
# This makes rotation around local Y an actual 3D wingbeat.
def make_wing(name, side, upper):
    if upper:
        outline = [(0,0),(.15,.35),(.47,.87),(.95,1.15),(1.35,1.06),(1.45,.81),(1.3,.35),(.9,.02),(.4,-.06)]
    else:
        outline = [(0,0),(.28,-.14),(.77,-.21),(1.02,-.45),(.85,-.77),(.46,-.70),(.14,-.36)]
    verts = [(0,0,0)]
    verts += [(side*x, y, .02*(x**2)) for x,y in outline[1:]]
    faces = []
    for i in range(1,len(verts)-1): faces.append((0,i,i+1))
    mesh = bpy.data.meshes.new(name+' mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(olive)
    obj.data.materials.append(cream)
    for face in mesh.polygons:
        face.material_index = 0 if face.index%3 else 1
    # Small veining strands follow the same animated parent.
    for idx in range(2,len(outline),2):
        start=Vector((0,0,.04)); end=Vector((side*outline[idx][0],outline[idx][1],.07))
        diff=end-start
        bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=.006,depth=diff.length,location=(start+end)/2)
        cyl=bpy.context.object
        cyl.name=name+' vein '+str(idx)
        cyl.rotation_euler=diff.to_track_quat('Z','Y').to_euler()
        cyl.data.materials.append(vein)
        cyl.parent=obj
        cyl.matrix_parent_inverse=obj.matrix_world.inverted()
    # Tiny scale-pattern markings.
    marks = [(0.9,.72,.10),(1.12,.66,.06)] if upper else [(.64,-.4,.09)]
    for j,(x,y,r) in enumerate(marks):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=1,location=(side*x,y,.08))
        dot=bpy.context.object
        dot.name=name+' champagne spot '+str(j)
        dot.scale=(r,r*.65,.012)
        dot.data.materials.append(spotmat)
        dot.parent=obj
        dot.matrix_parent_inverse=obj.matrix_world.inverted()
    return obj

wings=[]
for side in (-1,1):
    for upper in (True,False):
        wing=make_wing(('Left' if side<0 else 'Right')+(' forewing' if upper else ' hindwing'),side,upper)
        wings.append((wing,side,upper))

bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=(0,-.20,.12))
abdomen=bpy.context.object
abdomen.name='Butterfly abdomen'
abdomen.scale=(.095,.48,.12)
abdomen.data.materials.append(bodymat)

bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=(0,.32,.13))
head=bpy.context.object
head.name='Butterfly head'
head.scale=(.12,.13,.13)
head.data.materials.append(bodymat)

for side in (-1,1):
    curve=bpy.data.curves.new('Antenna curve','CURVE')
    curve.dimensions='3D'
    curve.bevel_depth=.009
    curve.bevel_resolution=3
    spline=curve.splines.new('BEZIER')
    spline.bezier_points.add(2)
    pts=[(0,.42,.13),(side*.12,.64,.12),(side*.30,.72,.09)]
    for p,co in zip(spline.bezier_points,pts):
        p.co=co
        p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    obj=bpy.data.objects.new('Antenna '+str(side),curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(vein)

# Repeating 2-second wing-flap cycle, editable in the Dope Sheet.
for wing,side,upper in wings:
    for frame in (1,7,13,19,25,31,37,43,48):
        phase=(frame-1)/12*math.pi
        angle=.16+.78*(.5+.5*math.sin(phase))
        wing.rotation_euler[1]=side*angle
        wing.keyframe_insert(data_path='rotation_euler',index=1,frame=frame)
    if wing.animation_data and wing.animation_data.action:
        action=wing.animation_data.action
        # Cyclic animation is optional; the web animation may control the flap.
        try:
            for fcurve in action.fcurves:
                for key in fcurve.keyframe_points:
                    key.interpolation='BEZIER'
        except AttributeError:
            pass

bpy.ops.object.select_all(action='DESELECT')
for wing,_,_ in wings:wing.select_set(True)
bpy.context.view_layer.objects.active=wings[0][0]
scene.frame_set(1)
print('Created K&C butterfly with four hinged wings and 48-frame wing-flap animation.')
print('Export as glTF 2.0 (.glb) from Blender to use as a future Three.js asset.')
